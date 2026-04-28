import { CreatureState } from '@/data/types/CreatureTypes';
import { WorldState } from '@/data/types/WorldTypes';
import { NEED_DECAY_RATES, MAX_NEED_VALUE, OFFLINE_SIMULATION } from '@/data/constants/GameConstants';
import { LifeStage } from '@/data/types/CommonTypes';

export interface AbsenceSummary {
  hoursAway: number;
  events: AbsenceEvent[];
}

export interface AbsenceEvent {
  type: 'needDecay' | 'careMistake' | 'randomEvent' | 'emergency';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class AbsenceSimulator {
  private readonly BATCH_SIZE_MINUTES = 60;
  private readonly MAX_OFFLINE_HOURS = OFFLINE_SIMULATION.maxOfflineHours;

  simulateAbsence(
    lastTimestamp: number,
    currentTimestamp: number,
    creature: CreatureState,
    world: WorldState,
  ): { creature: CreatureState; summary: AbsenceSummary } {
    let deltaMinutes = (currentTimestamp - lastTimestamp) / 60000;
    
    const cappedHours = Math.min(deltaMinutes / 60, this.MAX_OFFLINE_HOURS);
    deltaMinutes = Math.min(deltaMinutes, this.MAX_OFFLINE_HOURS * 60);

    const summary: AbsenceSummary = {
      hoursAway: cappedHours,
      events: [],
    };

    let simulatedCreature = { ...creature };
    let minutesProcessed = 0;

    const lifeStage: LifeStage = simulatedCreature.stage;
    const decayRates = NEED_DECAY_RATES[lifeStage];

    while (minutesProcessed < deltaMinutes) {
      const batchMinutes = Math.min(this.BATCH_SIZE_MINUTES, deltaMinutes - minutesProcessed);
      
      const prevNeeds = { ...simulatedCreature.needs };
      
      simulatedCreature.needs = {
        hunger: Math.max(0, simulatedCreature.needs.hunger - decayRates.hunger * (batchMinutes / 60)),
        energy: Math.max(0, simulatedCreature.needs.energy - decayRates.energy * (batchMinutes / 60)),
        mood: Math.max(0, simulatedCreature.needs.mood - decayRates.mood * (batchMinutes / 60)),
        discipline: Math.max(0, simulatedCreature.needs.discipline - decayRates.discipline * (batchMinutes / 60)),
      };

      const currentHour = this.getHourFromWorld(world, minutesProcessed);
      const isDay = currentHour >= 7 && currentHour < 20;

      if (simulatedCreature.needs.hunger === 0 && prevNeeds.hunger > 0) {
        const starvingMinutes = batchMinutes;
        if (starvingMinutes > 15) {
          summary.events.push({
            type: 'careMistake',
            description: 'Creature went hungry for extended period',
            severity: 'high',
          });
          simulatedCreature.careMistakes += 1;
        }
      }

      if (simulatedCreature.needs.energy === 0 && isDay && prevNeeds.energy > 0) {
        summary.events.push({
          type: 'careMistake',
          description: 'Creature exhausted during daytime',
          severity: 'medium',
        });
        simulatedCreature.careMistakes += 1;
      }

      if (simulatedCreature.needs.mood === 0 && prevNeeds.mood > 0) {
        const depressedMinutes = batchMinutes;
        if (depressedMinutes > 30) {
          summary.events.push({
            type: 'careMistake',
            description: 'Creature experienced prolonged low mood',
            severity: 'medium',
          });
          simulatedCreature.careMistakes += 1;
        }
      }

      if (Math.random() < OFFLINE_SIMULATION.randomEventChance) {
        const eventSeverity: 'low' | 'medium' | 'high' = 
          Math.random() < 0.6 ? 'low' : Math.random() < 0.9 ? 'medium' : 'high';
        
        const eventDescriptions = [
          'Wild creature wandered nearby',
          'Weather change affected the area',
          'Mysterious item appeared',
          'Noise startled the creature',
        ];
        
        summary.events.push({
          type: 'randomEvent',
          description: eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)],
          severity: eventSeverity,
        });
      }

      if (simulatedCreature.needs.hunger === 0 && simulatedCreature.needs.energy === 0 && simulatedCreature.needs.mood < 20) {
        summary.events.push({
          type: 'emergency',
          description: 'Creature in critical condition - immediate care needed',
          severity: 'high',
        });
        simulatedCreature.fatigue = Math.min(MAX_NEED_VALUE, simulatedCreature.fatigue + 20);
        break;
      }

      minutesProcessed += batchMinutes;
    }

    if (simulatedCreature.needs.hunger < 30) {
      summary.events.push({
        type: 'needDecay',
        description: 'Hunger critically low',
        severity: 'high',
      });
    }

    if (simulatedCreature.needs.energy < 30) {
      summary.events.push({
        type: 'needDecay',
        description: 'Energy severely depleted',
        severity: 'medium',
      });
    }

    if (simulatedCreature.needs.mood < 30) {
      summary.events.push({
        type: 'needDecay',
        description: 'Mood has dropped significantly',
        severity: 'medium',
      });
    }

    simulatedCreature.history.push({
      timestamp: currentTimestamp,
      type: 'absence',
      description: `Away for ${cappedHours.toFixed(1)} hours`,
    });

    return { creature: simulatedCreature, summary };
  }

  private getHourFromWorld(world: WorldState, minutesOffset: number): number {
    const baseHour = Math.floor((world.gameTime % (24 * 60)) / 60);
    const addedHours = Math.floor(minutesOffset / 60);
    return (baseHour + addedHours) % 24;
  }
}

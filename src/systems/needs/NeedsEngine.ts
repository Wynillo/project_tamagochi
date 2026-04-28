import { CreatureState, Needs } from '@/data/types/CreatureTypes';
import { ItemData } from '@/data/types/ItemTypes';
import { NEED_DECAY_RATES, MAX_NEED_VALUE } from '@/data/constants/GameConstants';
import { LifeStage } from '@/data/types/CommonTypes';

export class NeedsEngine {
  constructor(
    private getState: () => CreatureState,
    private setState: (updater: (state: CreatureState) => void) => void,
  ) {}

  tick(deltaMinutes: number, isNight: boolean) {
    const state = this.getState();
    const lifeStage: LifeStage = state.stage;
    const decayRates = NEED_DECAY_RATES[lifeStage];

    this.setState((s) => {
      const _previousNeeds = { ...s.needs };

      s.needs.hunger = this.clamp(
        s.needs.hunger - decayRates.hunger * (deltaMinutes / 60),
      );
      s.needs.energy = this.clamp(
        s.needs.energy - (isNight ? decayRates.energy * 1.5 : decayRates.energy) * (deltaMinutes / 60),
      );
      s.needs.mood = this.clamp(
        s.needs.mood - decayRates.mood * (deltaMinutes / 60),
      );
      s.needs.discipline = this.clamp(
        s.needs.discipline - decayRates.discipline * (deltaMinutes / 60),
      );

      const mistakes = this.checkCareMistakes(_previousNeeds, s.needs, deltaMinutes);
      if (mistakes.length > 0) {
        s.careMistakes += mistakes.length;
        for (const mistake of mistakes) {
          s.history.push({
            timestamp: Date.now(),
            type: 'careMistake',
            description: mistake,
          });
        }
      }

      if (s.needs.energy < 30) {
        s.fatigue = Math.min(MAX_NEED_VALUE, s.fatigue + deltaMinutes / 10);
      } else if (s.needs.energy > 70 && s.fatigue > 0) {
        s.fatigue = Math.max(0, s.fatigue - deltaMinutes / 20);
      }
    });
  }

  checkCareMistakes(previousNeeds: Needs, currentNeeds: Needs, deltaMinutes: number): string[] {
    const mistakes: string[] = [];

    if (previousNeeds.hunger > 0 && currentNeeds.hunger === 0) {
      mistakes.push('Creature became hungry');
    }

    if (previousNeeds.energy > 0 && currentNeeds.energy === 0) {
      mistakes.push('Creature became exhausted');
    }

    if (previousNeeds.mood > 0 && currentNeeds.mood === 0 && deltaMinutes > 30) {
      mistakes.push('Creature became depressed');
    }

    return mistakes;
  }

  feed(foodItem: ItemData) {
    if (foodItem.type !== 'food') {
      return { success: false, reason: 'Item is not food' };
    }

    let hungerRestored = 0;
    let moodChange = 0;
    let energyChange = 0;

    for (const effect of foodItem.effects) {
      if (effect.type === 'heal' && effect.needType === 'hunger') {
        hungerRestored = effect.value;
      }
      if (effect.type === 'boost' && effect.needType === 'mood') {
        moodChange = effect.value;
      }
      if (effect.type === 'boost' && effect.needType === 'energy') {
        energyChange = effect.value;
      }
    }

    if (hungerRestored === 0) {
      hungerRestored = 25;
    }

    this.setState((s) => {
      s.needs.hunger = this.clamp(s.needs.hunger + hungerRestored);
      s.needs.mood = this.clamp(s.needs.mood + moodChange);
      s.needs.energy = this.clamp(s.needs.energy + energyChange);

      s.history.push({
        timestamp: Date.now(),
        type: 'feed',
        description: `Fed ${foodItem.name}, hunger +${hungerRestored}`,
      });
    });

    return { success: true, hungerRestored };
  }

  sleep(hours: number) {
    const energyRestored = Math.min(100, hours * 10);
    const quality = hours >= 6 ? 'good' : hours >= 4 ? 'fair' : 'poor';

    this.setState((s) => {
      s.needs.energy = this.clamp(s.needs.energy + energyRestored);
      s.fatigue = Math.max(0, s.fatigue - hours * 5);

      s.history.push({
        timestamp: Date.now(),
        type: 'sleep',
        description: `Slept for ${hours} hours (${quality} quality), energy +${energyRestored}`,
      });
    });

    return { success: true, energyRestored, quality };
  }

  play() {
    const moodGain = 10;
    const energyCost = 2;

    const state = this.getState();
    if (state.needs.energy < energyCost) {
      return { success: false, reason: 'Not enough energy' };
    }

    this.setState((s) => {
      s.needs.mood = this.clamp(s.needs.mood + moodGain);
      s.needs.energy = this.clamp(s.needs.energy - energyCost);

      s.history.push({
        timestamp: Date.now(),
        type: 'play',
        description: `Played together, mood +${moodGain}, energy -${energyCost}`,
      });
    });

    return { success: true, moodGain, energyCost };
  }

  scold() {
    const disciplineGain = 5;
    const moodLoss = 8;

    this.setState((s) => {
      s.needs.discipline = this.clamp(s.needs.discipline + disciplineGain);
      s.needs.mood = this.clamp(s.needs.mood - moodLoss);

      s.history.push({
        timestamp: Date.now(),
        type: 'scold',
        description: `Scolded creature, discipline +${disciplineGain}, mood -${moodLoss}`,
      });
    });

    return { success: true, disciplineGain, moodLoss };
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(MAX_NEED_VALUE, value));
  }
}

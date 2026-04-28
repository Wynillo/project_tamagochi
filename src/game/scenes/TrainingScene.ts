import Phaser from 'phaser';
import { useGameStore } from '@/state/useGameStore';
import { TrainingManager } from '@/systems/training/TrainingManager';
import type { StatType, GameRank } from '@/data/types/CommonTypes';

const STAT_BUTTONS: Array<{ stat: StatType; label: string; color: number }> = [
  { stat: 'str', label: 'STR', color: 0xcc4444 },
  { stat: 'spd', label: 'SPD', color: 0x44aacc },
  { stat: 'int', label: 'INT', color: 0xaa44cc },
  { stat: 'sta', label: 'STA', color: 0x44cc44 },
];

const RANK_COLORS: Record<GameRank, string> = {
  S: '#ffdd57',
  A: '#44cc44',
  B: '#44aacc',
  C: '#cccc44',
  D: '#cc4444',
};

const MINI_GAME_SCENES: Record<StatType, string> = {
  str: 'TrainingStrengthScene',
  spd: 'TrainingSpeedScene',
  int: 'TrainingIntelligenceScene',
  sta: 'TrainingStaminaScene',
};

export class TrainingScene extends Phaser.Scene {
  private trainingManager!: TrainingManager;
  private resultOverlay: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'TrainingScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const store = useGameStore.getState();
    this.trainingManager = new TrainingManager();

    this.add.rectangle(0, 0, width, height, 0x12122a).setOrigin(0);

    this.add.text(width / 2, 40, 'Training', {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    const startY = 120;
    const btnW = 280;
    const btnH = 60;
    const gap = 20;

    STAT_BUTTONS.forEach((entry, i) => {
      const y = startY + i * (btnH + gap);
      const x = width / 2;
      const currentValue = store.creature.stats[entry.stat];
      const canTrain = this.trainingManager.canTrain(entry.stat, store.creature);

      const bgColor = canTrain ? 0x22223a : 0x1a1a22;
      const bg = this.add.rectangle(x, y, btnW, btnH, bgColor, 0.9)
        .setStrokeStyle(1, canTrain ? entry.color : 0x444444);

      this.add.text(x - 60, y, entry.label, {
        fontSize: '22px', color: canTrain ? '#ffffff' : '#666666', fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(x + 40, y, `${currentValue}`, {
        fontSize: '20px', color: canTrain ? '#ccccff' : '#555555',
      }).setOrigin(0.5);

      if (!canTrain) {
        this.add.text(x, y + 18, 'Too tired', {
          fontSize: '11px', color: '#884444',
        }).setOrigin(0.5);
      }

      if (canTrain) {
        const hitArea = this.add.rectangle(x, y, btnW, btnH, 0x000000, 0)
          .setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => bg.setFillStyle(0x33335a, 0.95));
        hitArea.on('pointerout', () => bg.setFillStyle(0x22223a, 0.9));
        hitArea.on('pointerdown', () => this.startMiniGame(entry.stat));
      }
    });

    this.game.events.on('trainingComplete', this.onTrainingComplete, this);
    this.events.on('shutdown', () => {
      this.game.events.off('trainingComplete', this.onTrainingComplete, this);
    });
  }

  private startMiniGame(stat: StatType): void {
    const store = useGameStore.getState();
    const config = this.trainingManager.getMiniGameConfig(stat, store.creature);

    this.scene.launch(config.sceneKey, {
      difficulty: config.difficulty,
      onComplete: (score: number) => {
        this.game.events.emit('trainingComplete', { stat, score });
      },
    });
  }

  private onTrainingComplete(data: { stat: StatType; score: number }): void {
    const { stat, score } = data;
    const store = useGameStore.getState();
    const result = this.trainingManager.completeTraining(stat, score, store.creature);

    useGameStore.getState().addStatGain(stat, result.statGain);
    useGameStore.getState().updateFatigue(result.fatigueIncrease);
    useGameStore.getState().updateNeeds({ mood: store.creature.needs.mood + result.moodChange });
    useGameStore.getState().advanceTime(result.timeSkipped);

    this.scene.stop(MINI_GAME_SCENES[stat]);
    this.showResultOverlay(result.stat, result.rank, result.statGain);
  }

  private showResultOverlay(stat: StatType, rank: GameRank, gain: number): void {
    const { width, height } = this.scale;

    const bg = this.add.rectangle(width / 2, height / 2, 300, 180, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffffff);
    const title = this.add.text(width / 2, height / 2 - 50, 'Training Complete!', {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);
    const rankText = this.add.text(width / 2, height / 2, `Rank: ${rank}`, {
      fontSize: '36px', color: RANK_COLORS[rank], fontStyle: 'bold',
    }).setOrigin(0.5);
    const gainText = this.add.text(width / 2, height / 2 + 40, `${stat.toUpperCase()} +${gain}`, {
      fontSize: '18px', color: '#88ff88',
    }).setOrigin(0.5);
    const hint = this.add.text(width / 2, height / 2 + 70, 'Tap to continue', {
      fontSize: '12px', color: '#888888',
    }).setOrigin(0.5);

    const overlay = this.add.container(0, 0, [bg, title, rankText, gainText, hint]).setDepth(200);

    this.input.once('pointerdown', () => {
      overlay.destroy();
      this.scene.start('HubScene');
    });
  }
}

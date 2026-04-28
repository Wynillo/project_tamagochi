import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';
import type { TimePhase } from '../../data/types/CommonTypes';

const PHASE_LABELS: Record<TimePhase, string> = {
  dawn: 'Dawn Approaches...',
  day: 'A New Day Begins',
  afternoon: 'The Sun Stands High',
  dusk: 'Dusk Falls...',
  night: 'Night Descends',
  deepNight: 'The Deep Night',
};

const PHASE_COLORS: Record<TimePhase, number> = {
  dawn: 0xff9800,
  day: 0xffeb3b,
  afternoon: 0xffc107,
  dusk: 0xff5722,
  night: 0x1a237e,
  deepNight: 0x0d0d2b,
};

const FADE_DURATION = 600;
const HOLD_DURATION = 800;

export class PhaseTransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PhaseTransitionScene' });
  }

  create(data?: { phase?: TimePhase }): void {
    const { width, height } = this.cameras.main;
    const phase = data?.phase ?? useGameStore.getState().time.phase;
    const color = PHASE_COLORS[phase];
    const label = PHASE_LABELS[phase];

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, color, 0);
    overlay.setAlpha(0);

    const phaseText = this.add.text(width / 2, height / 2, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    phaseText.setOrigin(0.5);
    phaseText.setAlpha(0);

    useGameStore.getState().setPhase(phase);

    this.tweens.add({
      targets: phaseText,
      alpha: { from: 0, to: 1 },
      duration: FADE_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(HOLD_DURATION, () => {
          this.tweens.add({
            targets: [overlay, phaseText],
            alpha: { from: 1, to: 0 },
            duration: FADE_DURATION,
            ease: 'Power2',
            onComplete: () => {
              this.scene.stop('PhaseTransitionScene');
              this.scene.resume('HubScene');
              useGameStore.getState().setCurrentScene('hub');
            },
          });
        });
      },
    });

    this.tweens.add({
      targets: overlay,
      alpha: { from: 0, to: 0.85 },
      duration: FADE_DURATION,
      ease: 'Power2',
    });
  }
}

import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';

const COLORS = {
  bg: 0x0f0e1a,
  panel: 0x16213e,
  barBg: 0x1a1a2e,
  text: '#b8b8d4',
  textDim: '#6c6c8c',
  textBright: '#e0e0ff',
  statStr: 0xe74c3c,
  statSpd: 0x2ecc71,
  statInt: 0x3498db,
  statSta: 0xf39c12,
  needHunger: 0xff7043,
  needEnergy: 0xffee58,
  needMood: 0xec407a,
  needDiscipline: 0x7e57c2,
  evoKnown: 0x6c63ff,
  evoUnknown: 0x3a3a5c,
  close: 0xe74c3c,
};

interface BarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  value: number;
  label: string;
}

export class CreatureScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreatureScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const store = useGameStore.getState();
    const { creature } = store;

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg, 0.92);

    const cx = width / 2;
    this.add.text(cx, 28, creature.name || 'Unnamed Creature', {
      fontFamily: '"Courier New", monospace',
      fontSize: '22px',
      color: COLORS.textBright,
    }).setOrigin(0.5);

    const stageLabel = creature.stage.charAt(0).toUpperCase() + creature.stage.slice(1);
    this.add.text(cx, 52, `Stage: ${stageLabel}  |  Species: ${creature.speciesId || '???'}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: COLORS.textDim,
    }).setOrigin(0.5);

    this.add.text(24, 80, 'Stats', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: COLORS.text,
    });

    const stats = creature.stats;
    const maxStat = 100;
    this.renderBar({ x: 24, y: 102, width: 180, height: 14, color: COLORS.statStr, value: stats.str / maxStat, label: `STR ${stats.str}` });
    this.renderBar({ x: 24, y: 122, width: 180, height: 14, color: COLORS.statSpd, value: stats.spd / maxStat, label: `SPD ${stats.spd}` });
    this.renderBar({ x: 24, y: 142, width: 180, height: 14, color: COLORS.statInt, value: stats.int / maxStat, label: `INT ${stats.int}` });
    this.renderBar({ x: 24, y: 162, width: 180, height: 14, color: COLORS.statSta, value: stats.sta / maxStat, label: `STA ${stats.sta}` });

    this.add.text(24, 192, 'Needs', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: COLORS.text,
    });

    const needs = creature.needs;
    this.renderBar({ x: 24, y: 214, width: 180, height: 14, color: COLORS.needHunger, value: needs.hunger / 100, label: `Hunger ${Math.round(needs.hunger)}` });
    this.renderBar({ x: 24, y: 234, width: 180, height: 14, color: COLORS.needEnergy, value: needs.energy / 100, label: `Energy ${Math.round(needs.energy)}` });
    this.renderBar({ x: 24, y: 254, width: 180, height: 14, color: COLORS.needMood, value: needs.mood / 100, label: `Mood ${Math.round(needs.mood)}` });
    this.renderBar({ x: 24, y: 274, width: 180, height: 14, color: COLORS.needDiscipline, value: needs.discipline / 100, label: `Disc. ${Math.round(needs.discipline)}` });

    this.add.text(24, 304, 'Personality', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: COLORS.text,
    });

    const traits = creature.personality.traits;
    if (traits.length > 0) {
      const traitStr = traits.map(t => `${t}(${creature.personality.traitStrengths[t] ?? 0})`).join('  ');
      this.add.text(24, 324, traitStr, {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: COLORS.textDim,
        wordWrap: { width: width - 48 },
      });
    } else {
      this.add.text(24, 324, 'No traits developed yet', {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: COLORS.textDim,
      });
    }

    this.add.text(24, 352, `Care Mistakes: ${creature.careMistakes}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: creature.careMistakes > 5 ? '#e74c3c' : COLORS.textDim,
    });

    this.add.text(24, 370, `Fatigue: ${Math.round(creature.fatigue)}%`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: creature.fatigue > 60 ? '#e74c3c' : COLORS.textDim,
    });

    this.add.text(24, 388, `Battles: ${creature.battlesWon}W / ${creature.battlesLost}L`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: COLORS.textDim,
    });

    this.add.text(24, 416, 'Evolution Tree', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: COLORS.text,
    });

    this.renderEvolutionDots(24, 438, creature.evolution.evolutionHistory, creature.evolution.evolutionCandidates);

    this.createCloseButton(cx, height - 40);
  }

  private renderBar(config: BarConfig): void {
    const { x, y, width, height, color, value, label } = config;

    this.add.rectangle(x, y, width, height, COLORS.barBg).setOrigin(0);
    this.add.rectangle(x, y, Math.max(0, Math.min(1, value)) * width, height, color).setOrigin(0);
    this.add.text(x + 4, y + height / 2, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: `${Math.min(11, height - 2)}px`,
      color: '#ffffff',
    }).setOrigin(0, 0.5);
  }

  private renderEvolutionDots(x: number, y: number, history: string[], candidates: { creatureId: string; isHidden: boolean }[]): void {
    const dotSize = 10;
    const gap = 18;
    let cx = x;

    const stages = ['egg', 'baby', 'child', 'adult', 'mature', 'elder'];
    stages.forEach((stage, i) => {
      const isKnown = history.length > i;
      const isCurrent = history.length === i;
      const color = isKnown ? COLORS.evoKnown : (isCurrent ? 0x8b83ff : COLORS.evoUnknown);

      const dot = this.add.circle(cx + dotSize / 2, y + dotSize / 2, dotSize / 2, color);

      if (isCurrent) {
        this.tweens.add({
          targets: dot,
          alpha: { from: 1, to: 0.5 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      }

      this.add.text(cx, y + dotSize + 4, stage.substring(0, 3), {
        fontFamily: '"Courier New", monospace',
        fontSize: '8px',
        color: isKnown ? COLORS.textDim : '#3a3a5c',
      }).setOrigin(0);

      cx += gap * 2.2;
    });

    const visibleCandidates = candidates.filter(c => !c.isHidden);
    if (visibleCandidates.length > 0) {
      this.add.text(x, y + dotSize + 20, `Next: ${visibleCandidates.length} possible evolution${visibleCandidates.length > 1 ? 's' : ''}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '11px',
        color: COLORS.textDim,
      });
    }
  }

  private createCloseButton(x: number, y: number): void {
    const btn = this.add.rectangle(x, y, 160, 36, COLORS.close, 0.85);
    btn.setStrokeStyle(2, 0xffffff, 0.3);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(x, y, 'Close', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', () => {
      this.scene.stop('CreatureScene');
      this.scene.resume('HubScene');
      useGameStore.getState().setCurrentScene('hub');
    });
  }
}

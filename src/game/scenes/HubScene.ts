import Phaser from 'phaser';
import { useGameStore } from '@/state/useGameStore';
import type { RegionId, TimePhase } from '@/data/types/CommonTypes';

const REGION_COLORS: Record<RegionId, number> = {
  nursery: 0x4a7c59,
  verdantThicket: 0x2d6a3f,
  searingDunes: 0xc2956b,
  ruinsOfAethelgard: 0x6b5b73,
  codeSpire: 0x3a506b,
  shimmeringDeeps: 0x1b4965,
};

const PHASE_OVERLAYS: Record<TimePhase, { color: number; alpha: number }> = {
  dawn: { color: 0xffcc88, alpha: 0.16 },
  day: { color: 0x000000, alpha: 0 },
  afternoon: { color: 0xffd700, alpha: 0.08 },
  dusk: { color: 0xff6600, alpha: 0.17 },
  night: { color: 0x000066, alpha: 0.26 },
  deepNight: { color: 0x000022, alpha: 0.34 },
};

export class HubScene extends Phaser.Scene {
  private creatureSprite!: Phaser.GameObjects.Arc;
  private glowRing!: Phaser.GameObjects.Arc;
  private lightingOverlay!: Phaser.GameObjects.Rectangle;
  private timeTickTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const store = useGameStore.getState();

    this.add.rectangle(0, 0, width, height, REGION_COLORS[store.world.currentRegion] ?? 0x333333).setOrigin(0);

    const cx = width / 2;
    const cy = height / 2 - 40;

    this.glowRing = this.add.circle(cx, cy, 52, 0xffffff, 0.15);
    this.creatureSprite = this.add.circle(cx, cy, 36, 0x76c89b);
    this.creatureSprite.setInteractive({ useHandCursor: true });

    this.add.text(cx, cy + 60, store.creature.name || '???', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.creatureSprite.on('pointerdown', () => {
      this.game.events.emit('showCreatureMenu');
    });

    this.drawNeedsBars(cx, cy - 70, store);

    this.drawBottomBar(width, height);

    this.lightingOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(100);

    this.startTimeTick();

    this.events.on('sleep', () => this.stopTimeTick());
    this.events.on('resume', () => this.startTimeTick());
  }

  update(time: number): void {
    const pulse = Math.sin(time / 500) * 0.08 + 0.15;
    this.glowRing.setFillStyle(0xffffff, pulse);

    const store = useGameStore.getState();
    const { hunger, mood, energy } = store.creature.needs;

    if (energy < 10) {
      this.creatureSprite.setAlpha(0.5);
      this.creatureSprite.setScale(1 + Math.sin(time / 1500) * 0.03);
    } else {
      this.creatureSprite.setAlpha(1);
      this.creatureSprite.setScale(1);
    }

    if (hunger < 30) {
      this.creatureSprite.setFillStyle(0xd4d4d4);
    } else if (mood < 30) {
      this.creatureSprite.setFillStyle(0x555555);
    } else {
      this.creatureSprite.setFillStyle(0x76c89b);
    }

    const phaseOverlay = PHASE_OVERLAYS[store.time.phase] ?? { color: 0x000000, alpha: 0 };
    this.lightingOverlay.setFillStyle(phaseOverlay.color, phaseOverlay.alpha);
  }

  private drawNeedsBars(cx: number, cy: number, store: ReturnType<typeof useGameStore.getState>): void {
    const needs = store.creature.needs;
    const barWidth = 120;
    const barHeight = 6;
    const entries = [
      { value: needs.hunger, color: 0xff9944 },
      { value: needs.energy, color: 0x44cc44 },
      { value: needs.mood, color: 0xcc44cc },
    ];

    entries.forEach((entry, i) => {
      const y = cy + i * 14;
      this.add.rectangle(cx - barWidth / 2, y, barWidth, barHeight, 0x333333).setOrigin(0);
      this.add.rectangle(cx - barWidth / 2, y, (entry.value / 100) * barWidth, barHeight, entry.color).setOrigin(0);
    });
  }

  private drawBottomBar(width: number, height: number): void {
    const barY = height - 60;
    const btnW = 100;
    const gap = 16;
    const totalW = btnW * 4 + gap * 3;
    const startX = (width - totalW) / 2;

    const buttons: Array<{ label: string; action: () => void }> = [
      { label: 'Inventory', action: () => this.game.events.emit('openInventory') },
      { label: 'Train', action: () => this.game.events.emit('openTraining') },
      { label: 'Map', action: () => this.scene.start('MapScene') },
      { label: 'Menu', action: () => this.game.events.emit('openMenu') },
    ];

    buttons.forEach((btn, i) => {
      const x = startX + i * (btnW + gap) + btnW / 2;
      const bg = this.add.rectangle(x, barY, btnW, 44, 0x22223a, 0.9)
        .setStrokeStyle(1, 0x6666aa);
      this.add.text(x, barY, btn.label, {
        fontSize: '14px',
        color: '#ccccff',
      }).setOrigin(0.5);

      const hitArea = this.add.rectangle(x, barY, btnW, 44, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => bg.setFillStyle(0x33335a, 0.95));
      hitArea.on('pointerout', () => bg.setFillStyle(0x22223a, 0.9));
      hitArea.on('pointerdown', btn.action);
    });
  }

  private startTimeTick(): void {
    if (this.timeTickTimer) this.timeTickTimer.destroy();
    this.timeTickTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const store = useGameStore.getState();
        if (!store.time.isPaused) {
          useGameStore.getState().tick(store.time.timeScale);
        }
      },
    });
  }

  private stopTimeTick(): void {
    if (this.timeTickTimer) {
      this.timeTickTimer.destroy();
      this.timeTickTimer = undefined;
    }
  }
}

import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';
import { SaveManager } from '../../persistence/SaveManager';

interface EggChoice {
  id: string;
  speciesId: string;
  color: number;
  accentColor: number;
  name: string;
}

const EGG_CHOICES: EggChoice[] = [
  { id: 'fire', speciesId: 'SPARKLESPHERE', color: 0xff6b4a, accentColor: 0xffaa33, name: 'Emberspark' },
  { id: 'water', speciesId: 'SPARKLESPHERE', color: 0x4a9eff, accentColor: 0x33d4ff, name: 'Tidewisp' },
  { id: 'earth', speciesId: 'SPARKLESPHERE', color: 0x7cb342, accentColor: 0xaed581, name: 'Stoneshell' },
  { id: 'air', speciesId: 'SPARKLESPHERE', color: 0xb0bec5, accentColor: 0xe0f7fa, name: 'Zephyrwing' },
  { id: 'light', speciesId: 'SPARKLESPHERE', color: 0xfff176, accentColor: 0xffffff, name: 'Sparklesphere' },
  { id: 'dark', speciesId: 'SPARKLESPHERE', color: 0x7c4dff, accentColor: 0xb388ff, name: 'Shadowmire' },
];

export class NewGameScene extends Phaser.Scene {
  private selectedEgg: EggChoice | null = null;
  private selectionHighlight: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'NewGameScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    const title = this.add.text(width / 2, height * 0.1, 'Choose Your Egg', {
      fontFamily: '"Courier New", monospace',
      fontSize: `${Math.min(width * 0.07, 36)}px`,
      color: '#e0dfff',
    });
    title.setOrigin(0.5);

    this.createEggGrid(width, height);

    const beginBtn = this.add.image(width / 2, height * 0.88, 'ui-button');
    beginBtn.setInteractive({ useHandCursor: true });
    beginBtn.setAlpha(0.4);

    const beginLabel = this.add.text(width / 2, height * 0.88, 'Begin', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#8b83ff',
    });
    beginLabel.setOrigin(0.5);

    beginBtn.on('pointerdown', () => {
      if (!this.selectedEgg) return;
      this.confirmSelection();
    });

    beginBtn.on('pointerover', () => {
      if (this.selectedEgg) {
        beginBtn.setTexture('ui-button-hover');
      }
    });

    beginBtn.on('pointerout', () => {
      beginBtn.setTexture('ui-button');
    });

    this.events.on('eggselected', (egg: EggChoice) => {
      this.selectedEgg = egg;
      beginBtn.setAlpha(1);
      beginLabel.setColor('#e0dfff');
      this.updateSelectionHighlight(egg);
    });
  }

  private createEggGrid(width: number, height: number): void {
    const cols = 3;
    const eggSize = 64;
    const gapX = 110;
    const gapY = 120;
    const startX = width / 2 - ((cols - 1) * gapX) / 2;
    const startY = height * 0.32;

    EGG_CHOICES.forEach((egg, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      const container = this.add.container(x, y);

      const gfx = this.add.graphics();
      gfx.fillStyle(egg.color, 0.3);
      gfx.fillCircle(0, 0, eggSize * 0.55);
      gfx.fillStyle(egg.color, 0.85);
      gfx.fillEllipse(0, 0, eggSize * 0.7, eggSize * 0.85);
      gfx.fillStyle(egg.accentColor, 0.5);
      gfx.fillEllipse(-6, -8, eggSize * 0.35, eggSize * 0.45);
      container.add(gfx);

      const hitArea = this.add.circle(0, 0, eggSize * 0.5, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      const nameLabel = this.add.text(0, eggSize * 0.55 + 12, egg.name, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: '#b8b8d4',
      });
      nameLabel.setOrigin(0.5);
      container.add(nameLabel);

      hitArea.on('pointerover', () => {
        gfx.setScale(1.1);
      });
      hitArea.on('pointerout', () => {
        gfx.setScale(1.0);
      });
      hitArea.on('pointerdown', () => {
        this.events.emit('eggselected', egg);
      });
    });
  }

  private updateSelectionHighlight(egg: EggChoice): void {
    if (this.selectionHighlight) {
      this.selectionHighlight.destroy();
    }

    const { width, height } = this.cameras.main;
    const cols = 3;
    const gapX = 110;
    const gapY = 120;
    const startX = width / 2 - ((cols - 1) * gapX) / 2;
    const startY = height * 0.32;

    const idx = EGG_CHOICES.indexOf(egg);
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = startX + col * gapX;
    const y = startY + row * gapY;

    this.selectionHighlight = this.add.graphics();
    this.selectionHighlight.lineStyle(3, egg.accentColor, 0.9);
    this.selectionHighlight.strokeCircle(x, y, 42);
  }

  private confirmSelection(): void {
    if (!this.selectedEgg) return;

    const rawName = window.prompt('Name your creature:', 'Lumi');
    if (!rawName) return;

    const name = this.sanitizeName(rawName);
    if (!name) return;

    const store = useGameStore.getState();
    store.startGame(this.selectedEgg.speciesId, name);
    const state = useGameStore.getState();
    SaveManager.save('autosave', {
      version: '1.0.0',
      savedAt: Date.now(),
      checksum: '',
      creature: state.creature,
      world: state.world,
      time: state.time,
      inventory: state.inventory,
      player: state.player,
    }).then(() => {
      this.scene.start('HubScene');
    }).catch(() => {
      this.scene.start('HubScene');
    });
  }

  private sanitizeName(input: string): string {
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .slice(0, 12);
  }
}

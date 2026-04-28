import Phaser from 'phaser';
import { SaveManager } from '../../persistence/SaveManager';
import { useGameStore } from '../../state/useGameStore';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const whiteGfx = this.add.graphics();
    whiteGfx.fillStyle(0xffffff);
    whiteGfx.fillRect(0, 0, 1, 1);
    whiteGfx.generateTexture('white', 1, 1);
    whiteGfx.destroy();

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x3a3a5c, 1);
    btnGfx.fillRoundedRect(0, 0, 240, 56, 12);
    btnGfx.generateTexture('ui-button', 240, 56);
    btnGfx.destroy();

    const btnHoverGfx = this.add.graphics();
    btnHoverGfx.fillStyle(0x5a5a8c, 1);
    btnHoverGfx.fillRoundedRect(0, 0, 240, 56, 12);
    btnHoverGfx.generateTexture('ui-button-hover', 240, 56);
    btnHoverGfx.destroy();

    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x16213e, 0.9);
    panelGfx.fillRoundedRect(0, 0, 320, 480, 16);
    panelGfx.generateTexture('ui-panel', 320, 480);
    panelGfx.destroy();

    this.createCreaturePlaceholder();
  }

  private createCreaturePlaceholder(): void {
    const size = 80;
    const gfx = this.add.graphics();

    // Outer glow ring
    gfx.fillStyle(0x6c63ff, 0.3);
    gfx.fillCircle(size / 2, size / 2, 36);

    // Inner body
    gfx.fillStyle(0x8b83ff, 0.8);
    gfx.fillCircle(size / 2, size / 2, 24);

    // Core highlight
    gfx.fillStyle(0xc4bfff, 1);
    gfx.fillCircle(size / 2, size / 2 - 4, 10);

    // Eyes
    gfx.fillStyle(0x1a1a2e, 1);
    gfx.fillCircle(size / 2 - 8, size / 2 - 2, 3);
    gfx.fillCircle(size / 2 + 8, size / 2 - 2, 3);

    // Eye highlights
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(size / 2 - 7, size / 2 - 3, 1.2);
    gfx.fillCircle(size / 2 + 9, size / 2 - 3, 1.2);

    gfx.generateTexture('creature-placeholder', size, size);
    gfx.destroy();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    const loadingText = this.add.text(width / 2, height / 2, 'Loading Digital Companion...', {
      fontFamily: '"Courier New", monospace',
      fontSize: '18px',
      color: '#b8b8d4',
    });
    loadingText.setOrigin(0.5);

    SaveManager.hasSave('autosave').then((hasSave) => {
      loadingText.destroy();

      if (hasSave) {
        const store = useGameStore.getState();
        if (store.creature.speciesId) {
          this.scene.start('HubScene');
        } else {
          this.scene.start('MainMenuScene');
        }
      } else {
        this.scene.start('MainMenuScene');
      }
    }).catch(() => {
      loadingText.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}

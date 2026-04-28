import Phaser from 'phaser';
import { SaveManager } from '../../persistence/SaveManager';

interface MenuButton {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  enabled: boolean;
}

export class MainMenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private starfield: { x: number; y: number; speed: number; gfx: Phaser.GameObjects.Graphics }[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.createStarfield(width, height);

    const title = this.add.text(width / 2, height * 0.18, 'DIGITAL\nCOMPANION', {
      fontFamily: '"Courier New", monospace',
      fontSize: `${Math.min(width * 0.1, 52)}px`,
      color: '#e0dfff',
      align: 'center',
      lineSpacing: 8,
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height * 0.32, 'Raise. Train. Evolve.', {
      fontFamily: '"Courier New", monospace',
      fontSize: `${Math.min(width * 0.04, 18)}px`,
      color: '#8b83ff',
    });
    subtitle.setOrigin(0.5);

    const buttonY = height * 0.5;
    const buttonGap = 72;

    this.buttons = [
      this.createButton(width / 2, buttonY, 'New Game', true, () => {
        this.scene.start('NewGameScene');
      }),
      this.createButton(width / 2, buttonY + buttonGap, 'Continue', false, () => {
        this.scene.start('HubScene');
      }),
      this.createButton(width / 2, buttonY + buttonGap * 2, 'Options', true, () => {
        console.log('[MainMenuScene] Options not yet implemented');
      }),
    ];

    SaveManager.hasSave('autosave').then((hasSave) => {
      if (hasSave) {
        this.enableButton(this.buttons[1], true);
      }
    });

    const version = this.add.text(width / 2, height - 24, 'v0.1.0 MVP', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#4a4a6a',
    });
    version.setOrigin(0.5);
  }

  update(_time: number, delta: number): void {
    this.updateStarfield(delta);
  }

  private createStarfield(width: number, height: number): void {
    const count = 80;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const speed = Phaser.Math.FloatBetween(0.01, 0.06);
      const size = Phaser.Math.FloatBetween(1, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

      const gfx = this.add.graphics();
      gfx.fillStyle(0xb8b8d4, alpha);
      gfx.fillCircle(0, 0, size);
      gfx.setPosition(x, y);

      this.starfield.push({ x, y, speed, gfx });
    }
  }

  private updateStarfield(delta: number): void {
    const dt = delta / 1000;
    const { width, height } = this.cameras.main;

    for (const star of this.starfield) {
      star.y += star.speed * dt * 60;
      if (star.y > height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, width);
      }
      star.gfx.setPosition(star.x, star.y);
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    enabled: boolean,
    onClick: () => void,
  ): MenuButton {
    const container = this.add.container(x, y);

    const bg = this.add.image(0, 0, 'ui-button');
    bg.setInteractive({ useHandCursor: enabled });

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: enabled ? '#e0dfff' : '#555577',
    });
    label.setOrigin(0.5);

    container.add([bg, label]);

    if (enabled) {
      bg.on('pointerover', () => {
        bg.setTexture('ui-button-hover');
      });
      bg.on('pointerout', () => {
        bg.setTexture('ui-button');
      });
      bg.on('pointerdown', () => {
        onClick();
      });
    }

    return { container, bg, label, enabled };
  }

  private enableButton(button: MenuButton, enabled: boolean): void {
    button.enabled = enabled;
    button.label.setColor(enabled ? '#e0dfff' : '#555577');
    button.bg.setInteractive({ useHandCursor: enabled });

    if (enabled) {
      button.bg.on('pointerover', () => {
        button.bg.setTexture('ui-button-hover');
      });
      button.bg.on('pointerout', () => {
        button.bg.setTexture('ui-button');
      });
      button.bg.on('pointerdown', () => {
        this.scene.start('HubScene');
      });
    }
  }
}

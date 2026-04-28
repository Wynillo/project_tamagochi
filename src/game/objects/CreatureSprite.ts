import Phaser from 'phaser';

export class CreatureSprite extends Phaser.GameObjects.Container {
  private bodyCircle: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.glow = scene.add.circle(0, 0, 36, 0x6c63ff, 0.3);
    this.add(this.glow);

    this.bodyCircle = scene.add.circle(0, 0, 24, 0x88ccff, 0.9);
    this.add(this.bodyCircle);

    const leftEye = scene.add.circle(-8, -4, 3, 0x1a1a2e);
    const rightEye = scene.add.circle(8, -4, 3, 0x1a1a2e);
    this.add(leftEye);
    this.add(rightEye);

    const leftHighlight = scene.add.circle(-7, -5, 1.2, 0xffffff);
    const rightHighlight = scene.add.circle(9, -5, 1.2, 0xffffff);
    this.add(leftHighlight);
    this.add(rightHighlight);

    scene.tweens.add({
      targets: this.bodyCircle,
      scale: { from: 1, to: 1.08 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: this.glow,
      scale: { from: 1, to: 1.15 },
      alpha: { from: 0.3, to: 0.15 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    (scene.add as Phaser.GameObjects.GameObjectFactory).existing(this);
  }

  setStateTint(hunger: number, mood: number): void {
    const hungerFactor = Math.max(0, Math.min(1, hunger / 100));
    const moodFactor = Math.max(0, Math.min(1, mood / 100));

    // 0x88ccff well-fed/happy → 0xff8844 hungry → 0x665588 sad → 0x883333 both
    const r = Math.round(0x88 + (0xff - 0x88) * (1 - hungerFactor) * 0.6 + (0x66 - 0x88) * (1 - moodFactor) * 0.3);
    const g = Math.round(0xcc + (0x88 - 0xcc) * (1 - hungerFactor) * 0.5 + (0x55 - 0xcc) * (1 - moodFactor) * 0.4);
    const b = Math.round(0xff + (0x44 - 0xff) * (1 - hungerFactor) * 0.5 + (0x88 - 0xff) * (1 - moodFactor) * 0.3);

    const clamped = (v: number) => Math.max(0, Math.min(255, v));
    const newColor = Phaser.Display.Color.GetColor(clamped(r), clamped(g), clamped(b));
    this.bodyCircle.setFillStyle(newColor, 0.9);
  }

  playBounce(): void {
    this.scene.tweens.add({
      targets: this,
      scaleY: { from: 1, to: 0.8 },
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  playShake(): void {
    const baseX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: { from: baseX - 4, to: baseX + 4 },
      duration: 50,
      repeat: 4,
      yoyo: true,
      onComplete: () => this.setX(baseX),
    });
  }

  playSpin(): void {
    this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: 360 },
      duration: 500,
      ease: 'Cubic.easeInOut',
    });
  }
}

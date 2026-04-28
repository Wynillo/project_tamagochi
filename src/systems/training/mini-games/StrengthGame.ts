import Phaser from 'phaser';

export class StrengthGame extends Phaser.Scene {
  private powerBar!: Phaser.GameObjects.Graphics;
  private targetIndicator!: Phaser.GameObjects.Graphics;
  private greenZone!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  

  private powerLevel: number = 0;
  private targetPosition: number = 0;
  private targetDirection: number = 1;
  private targetSpeed: number = 2;
  private isHolding: boolean = false;
  private greenZoneTop: number = 0;
  private greenZoneBottom: number = 0;
  private difficulty: number = 1;
  private repsCompleted: number = 0;
  private totalReps: number = 5;
  private performanceScores: number[] = [];

  constructor() {
    super({ key: 'TrainingStrengthScene' });
  }

  init(data: { difficulty?: number; onComplete?: (score: number) => void }) {
    this.difficulty = data.difficulty || 1;
    this.targetSpeed = 1.5 + (this.difficulty * 0.3);
    const zoneSize = Math.max(40, 80 - (this.difficulty * 6));
    this.greenZoneTop = 250 - zoneSize / 2;
    this.greenZoneBottom = 250 + zoneSize / 2;
    this.events.once('complete', (score: number) => {
      if (data.onComplete) data.onComplete(score);
    });
  }

  preload(): void {
  }

  create(): void {
    this.powerLevel = 0;
    this.targetPosition = 50;
    this.repsCompleted = 0;
    this.performanceScores = [];

    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e).setOrigin(0);

    this.add.text(400, 30, 'Weight Lifting\nHold SPACE or touch to lift. Release in green zone!', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.add.rectangle(300, 300, 200, 400, 0x2d2d44).setOrigin(0.5);

    this.greenZone = this.add.graphics();
    this.greenZone.fillStyle(0x00ff00, 0.6);
    this.greenZone.fillRect(210, this.greenZoneTop, 180, this.greenZoneBottom - this.greenZoneTop);

    this.powerBar = this.add.graphics();
    this.updatePowerBar();

    this.targetIndicator = this.add.graphics();
    this.updateTargetIndicator();

    this.scoreText = this.add.text(550, 150, 'Rep: 0/5\nAccuracy: --', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'left',
    }).setOrigin(0, 0);

    this.add.text(300, 520, 'Perfect zone shrinks at higher levels', {
      fontSize: '14px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.input.keyboard?.on('keydown-SPACE', this.startLift, this);
    this.input.keyboard?.on('keyup-SPACE', this.endLift, this);
    this.input.on('pointerdown', this.startLift, this);
    this.input.on('pointerup', this.endLift, this);
  }

  private startLift = (): void => {
    this.isHolding = true;
  };

  private endLift = (): void => {
    if (this.isHolding && this.powerLevel > 0) {
      this.isHolding = false;
      const accuracy = this.calculateAccuracy(this.targetPosition);
      this.performanceScores.push(accuracy);
      this.repsCompleted++;
      this.updateScoreText();

      if (this.repsCompleted >= this.totalReps) {
        this.finishGame();
        return;
      }

      this.powerLevel = 0;
      this.updatePowerBar();
    } else {
      this.isHolding = false;
    }
  };

  private calculateAccuracy(targetPos: number): number {
    const center = (this.greenZoneTop + this.greenZoneBottom) / 2;
    const halfZone = (this.greenZoneBottom - this.greenZoneTop) / 2;
    const distanceFromCenter = Math.abs(targetPos - center);

    if (targetPos >= this.greenZoneTop && targetPos <= this.greenZoneBottom) {
      const maxDistInZone = halfZone;
      return 70 + Math.round(30 * (1 - distanceFromCenter / maxDistInZone));
    } else {
      const distanceFromZone = targetPos < this.greenZoneTop
        ? this.greenZoneTop - targetPos
        : targetPos - this.greenZoneBottom;
      return Math.max(0, 50 - Math.round(distanceFromZone / 5));
    }
  }

  private updatePowerBar(): void {
    this.powerBar.clear();
    this.powerBar.fillStyle(0x0088ff, 1);
    const barHeight = (this.powerLevel / 100) * 380;
    this.powerBar.fillRect(210, 490 - barHeight, 180, barHeight);
    this.powerBar.lineStyle(2, 0xffffff);
    this.powerBar.strokeRect(210, 110, 180, 380);
  }

  private updateTargetIndicator(): void {
    this.targetIndicator.clear();
    this.targetIndicator.fillStyle(0xff0000, 1);
    this.targetIndicator.fillRect(205, this.targetPosition - 5, 190, 10);
  }

  private updateScoreText(): void {
    const avgAccuracy = this.performanceScores.length > 0
      ? Math.round(this.performanceScores.reduce((a, b) => a + b, 0) / this.performanceScores.length)
      : 0;
    this.scoreText.setText(`Rep: ${this.repsCompleted}/${this.totalReps}\nAccuracy: ${avgAccuracy}`);
  }

  update(_delta: number): void {
    if (this.isHolding) {
      this.powerLevel = Math.min(100, this.powerLevel + 1.5);
      this.updatePowerBar();
    }

    this.targetPosition += this.targetSpeed * this.targetDirection;
    if (this.targetPosition <= 50 || this.targetPosition >= 450) {
      this.targetDirection *= -1;
    }
    this.updateTargetIndicator();
  }

  private finishGame(): void {
    const finalScore = this.performanceScores.length > 0
      ? Math.round(this.performanceScores.reduce((a, b) => a + b, 0) / this.performanceScores.length)
      : 0;

    this.input.keyboard?.off('keydown-SPACE', this.startLift, this);
    this.input.keyboard?.off('keyup-SPACE', this.endLift, this);
    this.input.off('pointerdown', this.startLift, this);
    this.input.off('pointerup', this.endLift, this);

    const _resultText = this.add.text(400, 500, `Training Complete!\nScore: ${finalScore}`, {
      fontSize: '28px',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.events.emit('complete', finalScore);
    });
  }
}

import Phaser from 'phaser';

export class StaminaGame extends Phaser.Scene {
  private breathMeter!: Phaser.GameObjects.Graphics;
  private targetZone!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  
  private breathText!: Phaser.GameObjects.Text;

  private meterPosition: number = 0;
  private meterSpeed: number = 2;
  
  private isPressing: boolean = false;
  private difficulty: number = 1;
  private breathsCompleted: number = 0;
  private totalBreaths: number = 10;
  private accuracyScores: number[] = [];
  private zoneSize: number = 100;
  private sinePhase: number = 0;
  private sineAmplitude: number = 0;

  constructor() {
    super({ key: 'TrainingStaminaScene' });
  }

  init(data: { difficulty?: number; onComplete?: (score: number) => void }) {
    this.difficulty = Math.max(1, data.difficulty || 1);
    this.meterSpeed = 1.5 + (this.difficulty * 0.2);
    this.zoneSize = Math.max(50, 120 - (this.difficulty * 8));
    this.events.once('complete', (score: number) => {
      if (data.onComplete) data.onComplete(score);
    });
  }

  preload(): void {
  }

  create(): void {
    this.accuracyScores = [];
    this.breathsCompleted = 0;
    this.sinePhase = 0;
    this.sineAmplitude = 300;

    this.add.rectangle(0, 0, 800, 600, 0x1a2e2e).setOrigin(0);

    this.add.text(400, 20, 'Breathing Exercise\nTap SPACE or screen when meter is centered!', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.add.rectangle(200, 300, 400, 100, 0x2d2d44).setOrigin(0.5);

    this.breathMeter = this.add.graphics();
    this.updateBreathMeter();

    this.targetZone = this.add.graphics();
    this.updateTargetZone();

    this.scoreText = this.add.text(550, 150, 'Breath: 0/10\nAccuracy: --', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'left',
    }).setOrigin(0, 0);

    this.breathText = this.add.text(400, 450, 'INHALE', {
      fontSize: '32px',
      color: '#00ffff',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.add.text(400, 520, 'Precision zone shrinks at higher levels', {
      fontSize: '14px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.input.keyboard?.on('keydown-SPACE', this.handleInput, this);
    this.input.on('pointerdown', this.handleInput, this);
  }

  private handleInput = (): void => {
    if (this.isPressing || this.breathsCompleted >= this.totalBreaths) return;

    this.isPressing = true;

    const center = 400;
    const halfZone = this.zoneSize / 2;
    const distanceFromCenter = Math.abs(this.meterPosition - center);

    let accuracy: number;
    if (distanceFromCenter <= halfZone) {
      accuracy = 70 + Math.round(30 * (1 - distanceFromCenter / halfZone));
      this.breathsCompleted++;
      this.accuracyScores.push(accuracy);
      this.updateScoreText();
      this.breathText.setText('GOOD!');
      this.breathText.setColor('#00ff00');
    } else {
      accuracy = Math.max(0, 50 - Math.round(distanceFromCenter / 10));
      this.accuracyScores.push(accuracy);
      this.breathText.setText('OFF');
      this.breathText.setColor('#ff4444');
    }

    this.time.delayedCall(500, () => {
      this.isPressing = false;
      if (this.breathsCompleted < this.totalBreaths) {
        this.breathText.setText(this.sinePhase < Math.PI ? 'EXHALE' : 'INHALE');
        this.breathText.setColor('#00ffff');
      } else {
        this.finishGame();
      }
    });
  };

  private updateBreathMeter(): void {
    this.breathMeter.clear();

    const barWidth = 20;
    const meterX = this.meterPosition - barWidth / 2;

    this.breathMeter.fillStyle(0x00ffff, 1);
    this.breathMeter.fillRect(meterX, 250, barWidth, 100);

    this.breathMeter.lineStyle(3, 0xffffff);
    this.breathMeter.strokeRect(190, 250, 420, 100);

    this.breathMeter.lineStyle(2, 0x888888);
    for (let i = 0; i <= 10; i++) {
      const x = 200 + i * 40;
      this.breathMeter.lineBetween(x, 240, x, 360);
    }
  }

  private updateTargetZone(): void {
    this.targetZone.clear();
    const center = 400;
    const halfZone = this.zoneSize / 2;

    this.targetZone.fillStyle(0x00ff00, 0.4);
    this.targetZone.fillRect(center - halfZone, 250, this.zoneSize, 100);

    this.targetZone.lineStyle(2, 0x00ff00);
    this.targetZone.strokeRect(center - halfZone, 250, this.zoneSize, 100);
  }

  private updateScoreText(): void {
    const avgAccuracy = this.accuracyScores.length > 0
      ? Math.round(this.accuracyScores.reduce((a, b) => a + b, 0) / this.accuracyScores.length)
      : 0;
    this.scoreText.setText(`Breath: ${this.breathsCompleted}/${this.totalBreaths}\nAccuracy: ${avgAccuracy}`);
  }

  update(_delta: number): void {
    if (this.breathsCompleted >= this.totalBreaths) return;

    this.sinePhase += 0.02 * this.meterSpeed;
    this.meterPosition = 400 + Math.sin(this.sinePhase) * this.sineAmplitude;

    const currentHalf = Math.sin(this.sinePhase);
    if (currentHalf > 0) {
      this.breathText.setText('EXHALE');
    } else {
      this.breathText.setText('INHALE');
    }

    this.updateBreathMeter();
  }

  private finishGame(): void {
    this.input.keyboard?.off('keydown-SPACE', this.handleInput, this);
    this.input.off('pointerdown', this.handleInput, this);

    const finalScore = this.accuracyScores.length > 0
      ? Math.round(this.accuracyScores.reduce((a, b) => a + b, 0) / this.accuracyScores.length)
      : 0;

    const resultText = this.add.text(400, 500, `Training Complete!\nAccuracy: ${finalScore}`, {
      fontSize: '28px',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.events.emit('complete', finalScore);
    });
  }
}

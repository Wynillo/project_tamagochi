import Phaser from 'phaser';

interface Obstacle {
  rect: Phaser.GameObjects.Rectangle;
  active: boolean;
}

export class SpeedGame extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private obstacles: Obstacle[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  

  private playerX: number = 400;
  private playerSpeed: number = 8;
  
  private difficulty: number = 1;
  private score: number = 0;
  private dodged: number = 0;
  private hits: number = 0;
  private timeRemaining: number = 30;
  private lastObstacleTime: number = 0;
  private obstacleInterval: number = 800;
  private gameActive: boolean = false;

  constructor() {
    super({ key: 'TrainingSpeedScene' });
  }

  init(data: { difficulty?: number; onComplete?: (score: number) => void }) {
    this.difficulty = data.difficulty || 1;
    this.obstacleInterval = Math.max(300, 800 - (this.difficulty * 50));
    this.events.once('complete', (score: number) => {
      if (data.onComplete) data.onComplete(score);
    });
  }

  preload(): void {
  }

  create(): void {
    this.score = 0;
    this.dodged = 0;
    this.hits = 0;
    this.timeRemaining = 30;
    this.obstacles = [];
    this.gameActive = true;

    this.add.rectangle(0, 0, 800, 600, 0x1a2e1a).setOrigin(0);

    this.add.text(400, 20, 'Obstacle Dash\nUse LEFT/RIGHT or A/D to dodge obstacles!', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.player = this.add.rectangle(400, 520, 40, 40, 0x00ff00);

    this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.input.keyboard?.addKeys('A,D');

    this.scoreText = this.add.text(20, 60, 'Dodged: 0\nHits: 0\nScore: 0', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'left',
    });

    this.timerText = this.add.text(780, 60, '30s', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'right',
    }).setOrigin(1, 0);

    this.add.text(400, 560, 'Avoid the falling blocks!', {
      fontSize: '14px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  private updateTimer(): void {
    if (!this.gameActive) return;

    this.timeRemaining--;
    this.timerText.setText(`${this.timeRemaining}s`);

    if (this.timeRemaining <= 0) {
      this.finishGame();
    }
  }

  private spawnObstacle(): void {
    const width = Phaser.Math.Between(30, 60);
    const x = Phaser.Math.Between(50 + width / 2, 750 - width / 2);
    const obstacle = this.add.rectangle(x, -30, width, 20, 0xff4444) as Phaser.GameObjects.Rectangle;
    this.obstacles.push({ rect: obstacle, active: true });
  }

  update(_delta: number): void {
    if (!this.gameActive) return;

    const now = this.time.now;
    if (now - this.lastObstacleTime > this.obstacleInterval) {
      this.spawnObstacle();
      this.lastObstacleTime = now;
    }

    const keys = this.input.keyboard;
    if (keys) {
      const arrowLeft = keys.keys['ArrowLeft' as keyof typeof keys.keys];
      const keyA = keys.keys['A' as keyof typeof keys.keys];
      const arrowRight = keys.keys['ArrowRight' as keyof typeof keys.keys];
      const keyD = keys.keys['D' as keyof typeof keys.keys];
      if ((arrowLeft as any)?.isDown || (keyA as any)?.isDown) {
        this.playerX = Math.max(50, this.playerX - this.playerSpeed);
      }
      if ((arrowRight as any)?.isDown || (keyD as any)?.isDown) {
        this.playerX = Math.min(750, this.playerX + this.playerSpeed);
      }
    }
    this.player.x = this.playerX;

    const playerBounds = this.player.getBounds();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.rect.y += 3 + (this.difficulty * 0.5);

      if (obs.active && obs.rect.y > 600) {
        obs.active = false;
        this.dodged++;
        this.score += 10;
        this.updateScoreText();
      }

      if (obs.active) {
        const obsBounds = obs.rect.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, obsBounds)) {
          obs.active = false;
          this.hits++;
          this.score = Math.max(0, this.score - 20);
          this.updateScoreText();
          this.cameras.main.shake(100, 0.01);
        }
      }

      if (obs.rect.y > 650) {
        obs.rect.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updateScoreText(): void {
    this.scoreText.setText(`Dodged: ${this.dodged}\nHits: ${this.hits}\nScore: ${this.score}`);
  }

  private finishGame(): void {
    this.gameActive = false;
    const timeBonus = Math.round(this.score / 10);
    const finalScore = this.score + timeBonus;

    this.input.keyboard?.removeAllListeners();

    const _resultText = this.add.text(400, 300, `Training Complete!\nDodged: ${this.dodged}\nHits: ${this.hits}\nTime Bonus: ${timeBonus}\nFinal Score: ${finalScore}`, {
      fontSize: '24px',
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

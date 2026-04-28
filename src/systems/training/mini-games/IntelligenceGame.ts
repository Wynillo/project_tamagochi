import Phaser from 'phaser';

export class IntelligenceGame extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private buttonTexts: Phaser.GameObjects.Text[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  

  private sequence: number[] = [];
  private playerSequence: number[] = [];
  private difficulty: number = 1;
  private sequenceLength: number = 3;
  private currentRound: number = 1;
  private totalRounds: number = 5;
  private score: number = 0;
  private isPlayerTurn: boolean = false;
  private isShowingSequence: boolean = false;
  private buttonColors: number[] = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
  private buttonPositions: { x: number; y: number }[] = [];

  constructor() {
    super({ key: 'TrainingIntelligenceScene' });
  }

  init(data: { difficulty?: number; onComplete?: (score: number) => void }) {
    this.difficulty = Math.max(1, data.difficulty || 1);
    this.sequenceLength = 3 + this.difficulty;
    this.events.once('complete', (score: number) => {
      if (data.onComplete) data.onComplete(score);
    });
  }

  preload(): void {
  }

  create(): void {
    this.currentRound = 1;
    this.score = 0;
    this.sequence = [];
    this.isShowingSequence = false;

    this.add.rectangle(0, 0, 800, 600, 0x1a1a3e).setOrigin(0);

    this.add.text(400, 20, 'Pattern Match\nWatch the sequence, then repeat it!', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.buttonPositions = [
      { x: 300, y: 250 },
      { x: 500, y: 250 },
      { x: 300, y: 400 },
      { x: 500, y: 400 },
    ];

    for (let i = 0; i < 4; i++) {
      const pos = this.buttonPositions[i];
      const button = this.add.rectangle(pos.x, pos.y, 140, 100, this.buttonColors[i])
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handleButtonClick(i));
      this.buttons.push(button);

      const text = this.add.text(pos.x, pos.y, `${i + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.buttonTexts.push(text);
    }

    this.scoreText = this.add.text(20, 80, `Score: 0\nRound: 1/${this.totalRounds}`, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'left',
    });

    this.roundText = this.add.text(400, 520, 'Watch...', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.add.text(400, 560, `Sequence length: ${this.sequenceLength}`, {
      fontSize: '14px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.time.delayedCall(1000, () => this.startRound());
  }

  private startRound(): void {
    this.playerSequence = [];
    this.sequence = this.generateSequence();
    this.isShowingSequence = true;
    this.isPlayerTurn = false;
    this.roundText.setText('Watch...');

    this.showSequence();
  }

  private generateSequence(): number[] {
    const seq: number[] = [];
    for (let i = 0; i < this.sequenceLength + (this.currentRound - 1); i++) {
      seq.push(Phaser.Math.Between(0, 3));
    }
    return seq;
  }

  private showSequence(): void {
    let index = 0;
    const flashInterval = Math.max(300, 600 - (this.difficulty * 40));

    this.time.addEvent({
      delay: flashInterval * 2,
      callback: () => {
        if (index >= this.sequence.length) {
          this.isShowingSequence = false;
          this.isPlayerTurn = true;
          this.roundText.setText('Your turn!');
          return;
        }

        this.flashButton(this.sequence[index]);
        index++;
      },
      repeat: this.sequence.length - 1,
    });
  }

  private flashButton(index: number): void {
    const button = this.buttons[index];
    const text = this.buttonTexts[index];

    button.setFillStyle(0xffffff);
    text.setColor('#000000');

    this.time.delayedCall(200, () => {
      button.setFillStyle(this.buttonColors[index]);
    });
  }

  private handleButtonClick(index: number): void {
    if (!this.isPlayerTurn || this.isShowingSequence) return;

    this.flashButton(index);
    this.playerSequence.push(index);

    const currentIndex = this.playerSequence.length - 1;

    if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
      this.roundText.setText('Wrong!');
      this.score = Math.max(0, this.score - 10);
      this.updateScoreText();
      this.time.delayedCall(1000, () => {
        this.currentRound++;
        if (this.currentRound > this.totalRounds) {
          this.finishGame();
        } else {
          this.startRound();
        }
      });
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.score += 20 * this.currentRound;
      this.updateScoreText();
      this.roundText.setText('Correct!');
      this.currentRound++;

      if (this.currentRound > this.totalRounds) {
        this.time.delayedCall(1000, () => this.finishGame());
      } else {
        this.time.delayedCall(1000, () => this.startRound());
      }
    }
  }

  private updateScoreText(): void {
    this.scoreText.setText(`Score: ${this.score}\nRound: ${Math.min(this.currentRound, this.totalRounds)}/${this.totalRounds}`);
  }

  private finishGame(): void {
    this.isPlayerTurn = false;
    this.input.removeAllListeners();
    this.buttons.forEach(btn => btn.disableInteractive());

    const maxPossibleScore = 20 * this.totalRounds * (this.sequenceLength + this.totalRounds) / 2;
    const finalScore = Math.min(100, Math.round((this.score / maxPossibleScore) * 100));

    const resultText = this.add.text(400, 300, `Training Complete!\nFinal Score: ${finalScore}`, {
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

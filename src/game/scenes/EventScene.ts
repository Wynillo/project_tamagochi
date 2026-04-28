import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';

interface EventData {
  npcName: string;
  dialogue: string;
  choices?: { text: string; action?: string }[];
}

const COLORS = {
  bg: 0x0f0e1a,
  panel: 0x16213e,
  text: '#e0e0ff',
  textDim: '#6c6c8c',
  accent: 0x6c63ff,
  choiceBtn: 0x3a3a6c,
  choiceHover: 0x5a5a8c,
  continueBtn: 0x4caf50,
};

export class EventScene extends Phaser.Scene {
  private currentEvent: EventData | null = null;
  private charIndex = 0;
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private dialogueText?: Phaser.GameObjects.Text;
  private choiceContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'EventScene' });
  }

  create(data?: { npcName?: string; dialogue?: string; choices?: { text: string; action?: string }[] }): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg, 0.88);

    this.currentEvent = {
      npcName: data?.npcName ?? 'Mysterious Voice',
      dialogue: data?.dialogue ?? 'The world hums with digital energy...',
      choices: data?.choices,
    };

    const panelWidth = Math.min(width - 40, 400);
    const panelX = width / 2;

    const namePlate = this.add.rectangle(panelX, 90, panelWidth, 32, COLORS.panel, 0.9);
    namePlate.setStrokeStyle(2, COLORS.accent);

    this.add.text(panelX, 90, this.currentEvent.npcName, {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.rectangle(panelX, height / 2, panelWidth, 200, COLORS.panel, 0.85)
      .setStrokeStyle(1, 0x3a3a6c);

    this.dialogueText = this.add.text(panelX - panelWidth / 2 + 16, height / 2 - 80, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '15px',
      color: COLORS.text,
      wordWrap: { width: panelWidth - 32 },
      lineSpacing: 4,
    });

    this.startTypewriter(this.currentEvent.dialogue);

    if (this.currentEvent.choices && this.currentEvent.choices.length > 0) {
      this.renderChoices(panelX, height / 2 + 130, panelWidth, this.currentEvent.choices);
    } else {
      this.renderContinueButton(panelX, height / 2 + 130);
    }
  }

  private startTypewriter(text: string): void {
    this.charIndex = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        this.charIndex++;
        if (this.dialogueText) {
          this.dialogueText.setText(text.substring(0, this.charIndex));
        }
        if (this.charIndex >= text.length && this.typewriterTimer) {
          this.typewriterTimer.destroy();
        }
      },
      loop: true,
    });
  }

  private renderChoices(cx: number, y: number, panelWidth: number, choices: { text: string; action?: string }[]): void {
    this.choiceContainer = this.add.container(cx, y);

    choices.forEach((choice, index) => {
      const btnY = index * 44;
      const btnWidth = panelWidth - 40;

      const bg = this.add.rectangle(0, btnY, btnWidth, 36, COLORS.choiceBtn);
      bg.setStrokeStyle(1, 0xffffff, 0.2);
      bg.setInteractive({ useHandCursor: true });

      const label = this.add.text(0, btnY, choice.text, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: COLORS.text,
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(COLORS.choiceHover));
      bg.on('pointerout', () => bg.setFillStyle(COLORS.choiceBtn));
      bg.on('pointerdown', () => {
        if (choice.action) this.executeAction(choice.action);
        this.closeEvent();
      });

      this.choiceContainer!.add(bg);
      this.choiceContainer!.add(label);
    });
  }

  private renderContinueButton(cx: number, y: number): void {
    const btn = this.add.rectangle(cx, y, 140, 38, COLORS.continueBtn, 0.9);
    btn.setStrokeStyle(2, 0xffffff, 0.3);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(cx, y, 'Continue', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', () => this.closeEvent());
  }

  private executeAction(action: string): void {
    const store = useGameStore.getState();
    switch (action) {
      case 'heal':
        store.updateNeeds({ energy: 100, hunger: 100, mood: 100 });
        break;
      case 'givePoints':
        store.addItem({ itemId: 'food_bread', quantity: 1, acquiredAt: Date.now() });
        break;
    }
  }

  private closeEvent(): void {
    if (this.typewriterTimer) this.typewriterTimer.destroy();
    useGameStore.getState().setActiveEvent(null);
    this.scene.stop('EventScene');
    this.scene.resume('HubScene');
  }
}

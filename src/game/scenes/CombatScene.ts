import Phaser from 'phaser';
import { CombatEngine } from '@/systems/combat/CombatEngine';
import { useGameStore } from '@/state/useGameStore';
import type { CombatCreature } from '@/data/types/CombatTypes';
import type { Tactic } from '@/data/types/CommonTypes';

interface CombatSceneData {
  playerCreature: CombatCreature;
  enemyCreature: CombatCreature;
}

const TACTIC_LABELS: Record<Tactic, string> = {
  goAllOut: 'Go All Out',
  playItSafe: 'Play It Safe',
  useYourHead: 'Use Your Head',
};

const TACTIC_KEYS: Tactic[] = ['goAllOut', 'playItSafe', 'useYourHead'];

export class CombatScene extends Phaser.Scene {
  private combatEngine!: CombatEngine;
  private playerCreature!: CombatCreature;
  private enemyCreature!: CombatCreature;

  private playerSprite!: Phaser.GameObjects.Arc;
  private enemySprite!: Phaser.GameObjects.Arc;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private isProcessing = false;

  constructor() {
    super({ key: 'CombatScene' });
  }

  create(data: CombatSceneData): void {
    const { width, height } = this.scale;

    this.playerCreature = { ...data.playerCreature };
    this.enemyCreature = { ...data.enemyCreature };

    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    this.playerSprite = this.add.circle(width * 0.25, height * 0.4, 40, 0x76c89b);
    this.enemySprite = this.add.circle(width * 0.75, height * 0.4, 40, 0xc94c4c);

    this.add.text(width * 0.25, height * 0.4 + 60, this.playerCreature.name, {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(width * 0.75, height * 0.4 + 60, this.enemyCreature.name, {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);

    const barWidth = 160;
    const barHeight = 12;

    this.playerHpBar = this.add.graphics();
    this.enemyHpBar = this.add.graphics();
    this.playerHpText = this.add.text(width * 0.25 - barWidth / 2, height * 0.4 - 60, '', {
      fontSize: '12px', color: '#ffffff',
    });
    this.enemyHpText = this.add.text(width * 0.75 - barWidth / 2, height * 0.4 - 60, '', {
      fontSize: '12px', color: '#ffffff',
    });

    this.drawHpBar(this.playerHpBar, width * 0.25 - barWidth / 2, height * 0.4 - 40,
      barWidth, barHeight, this.playerCreature.currentHp, this.playerCreature.maxHp);
    this.drawHpBar(this.enemyHpBar, width * 0.75 - barWidth / 2, height * 0.4 - 40,
      barWidth, barHeight, this.enemyCreature.currentHp, this.enemyCreature.maxHp);

    this.turnText = this.add.text(width / 2, 30, '', {
      fontSize: '18px', color: '#ffdd57',
    }).setOrigin(0.5);

    this.createTacticButtons(width, height);

    this.combatEngine = new CombatEngine(
      this.playerCreature,
      this.enemyCreature,
      (state) => this.onCombatStateChange(state),
    );
    this.combatEngine.start();
    this.updateTurnDisplay();
  }

  private createTacticButtons(width: number, height: number): void {
    const btnY = height - 60;
    const btnW = 140;
    const gap = 20;
    const totalW = btnW * 3 + gap * 2;
    const startX = (width - totalW) / 2;

    TACTIC_KEYS.forEach((tactic, i) => {
      const x = startX + i * (btnW + gap) + btnW / 2;
      const bg = this.add.rectangle(x, btnY, btnW, 44, 0x22223a, 0.9)
        .setStrokeStyle(1, 0x6666aa);
      this.add.text(x, btnY, TACTIC_LABELS[tactic], {
        fontSize: '14px', color: '#ccccff',
      }).setOrigin(0.5);

      const hitArea = this.add.rectangle(x, btnY, btnW, 44, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerdown', () => {
        if (!this.isProcessing) this.onTacticSelected(tactic);
      });
      hitArea.on('pointerover', () => bg.setFillStyle(0x33335a, 0.95));
      hitArea.on('pointerout', () => bg.setFillStyle(0x22223a, 0.9));
    });
  }

  private onTacticSelected(tactic: Tactic): void {
    this.isProcessing = true;
    this.combatEngine.selectTactic(tactic);
  }

  private onCombatStateChange(state: import('@/data/types/CombatTypes').CombatState): void {
    const { width, height } = this.scale;
    const barWidth = 160;
    const barHeight = 12;

    this.playerCreature = state.playerCreature;
    this.enemyCreature = state.enemyCreature;

    this.drawHpBar(this.playerHpBar, width * 0.25 - barWidth / 2, height * 0.4 - 40,
      barWidth, barHeight, this.playerCreature.currentHp, this.playerCreature.maxHp);
    this.drawHpBar(this.enemyHpBar, width * 0.75 - barWidth / 2, height * 0.4 - 40,
      barWidth, barHeight, this.enemyCreature.currentHp, this.enemyCreature.maxHp);

    const lastLog = state.battleLog[state.battleLog.length - 1];
    if (lastLog) {
      const attacker = lastLog.actor === 'player' ? this.playerSprite : this.enemySprite;
      this.showAttackAnimation(attacker);

      const target = lastLog.actor === 'player' ? this.enemySprite : this.playerSprite;
      if (lastLog.damage) {
        this.showDamageNumber(target.x, target.y - 50, lastLog.damage);
      }

      this.showFloatingText(width / 2, height * 0.2, lastLog.description, '#ffdd57');
    }

    this.updateTurnDisplay();

    if (state.phase === 'victory' || state.phase === 'defeat') {
      this.time.delayedCall(1500, () => {
        this.showResultBanner(state.phase === 'victory');
      });
    } else if (state.phase === 'player') {
      this.isProcessing = false;
    }
  }

  private showAttackAnimation(sprite: Phaser.GameObjects.Arc): void {
    this.tweens.add({
      targets: sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y, `-${damage}`, {
      fontSize: '22px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  private showFloatingText(x: number, y: number, message: string, color: string): void {
    const text = this.add.text(x, y, message, {
      fontSize: '14px', color,
      wordWrap: { width: 300 },
      align: 'center',
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
  }

  private drawHpBar(
    graphics: Phaser.GameObjects.Graphics, x: number, y: number,
    w: number, h: number, current: number, max: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, w, h);

    const ratio = Math.max(0, current / max);
    const fillColor = ratio > 0.5 ? 0x44cc44 : ratio > 0.2 ? 0xcccc44 : 0xcc4444;
    graphics.fillStyle(fillColor);
    graphics.fillRect(x, y, w * ratio, h);

    graphics.lineStyle(1, 0xffffff);
    graphics.strokeRect(x, y, w, h);

    this.playerHpText.setText(`${this.playerCreature.currentHp}/${this.playerCreature.maxHp}`);
    this.enemyHpText.setText(`${this.enemyCreature.currentHp}/${this.enemyCreature.maxHp}`);
  }

  private updateTurnDisplay(): void {
    const state = this.combatEngine.getState();
    const phase = state.phase;

    if (phase === 'player') {
      this.turnText.setText(`Round ${state.roundNumber} — Your turn`);
    } else if (['enemyTurn', 'creatureAI', 'attackChosen', 'resolve'].includes(phase)) {
      this.turnText.setText(`Round ${state.roundNumber} — Enemy turn`);
    } else if (phase === 'victory') {
      this.turnText.setText('Victory!');
    } else if (phase === 'defeat') {
      this.turnText.setText('Defeat...');
    }
  }

  private showResultBanner(isVictory: boolean): void {
    const { width, height } = this.scale;

    const banner = this.add.rectangle(width / 2, height / 2, 300, 80, 0x000000, 0.85)
      .setStrokeStyle(2, isVictory ? 0x44cc44 : 0xcc4444)
      .setDepth(100);
    const resultText = this.add.text(width / 2, height / 2 - 8, isVictory ? 'VICTORY' : 'DEFEAT', {
      fontSize: '28px', color: isVictory ? '#44cc44' : '#cc4444',
    }).setOrigin(0.5).setDepth(101);
    const continueHint = this.add.text(width / 2, height / 2 + 20, 'Tap to continue', {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(101);

    useGameStore.getState().advanceTime(15);

    this.input.once('pointerdown', () => {
      banner.destroy();
      resultText.destroy();
      continueHint.destroy();
      this.scene.start('HubScene');
    });
  }
}

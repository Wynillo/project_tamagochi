import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';
import type { TradeOffer } from '../../data/types/WorldTypes';

const SHOP_CATALOG: TradeOffer[] = [
  { itemId: 'food_bread', cost: { currency: 'points', amount: 10 }, quantity: 1, restockTime: 0 },
  { itemId: 'food_meal', cost: { currency: 'points', amount: 25 }, quantity: 1, restockTime: 0 },
  { itemId: 'food_treat', cost: { currency: 'points', amount: 15 }, quantity: 1, restockTime: 0 },
  { itemId: 'train_weight', cost: { currency: 'points', amount: 30 }, quantity: 1, restockTime: 0 },
  { itemId: 'battle_tonic', cost: { currency: 'points', amount: 20 }, quantity: 1, restockTime: 0 },
];

const SHOP_REGIONS = ['nursery', 'codeSpire'];

const COLORS = {
  bg: 0x0f0e1a,
  row: 0x16213e,
  rowHover: 0x1e2e5c,
  text: '#b8b8d4',
  textDim: '#6c6c8c',
  textBright: '#e0e0ff',
  buy: 0x4caf50,
  buyDisabled: 0x3a3a5c,
  close: 0xe74c3c,
  currency: 0xffd700,
};

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const store = useGameStore.getState();

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg, 0.92);

    this.add.text(width / 2, 30, 'Shop', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: COLORS.textBright,
    }).setOrigin(0.5);

    const points = store.inventory.currency.points;
    const gold = store.inventory.currency.gold;
    this.add.text(width / 2, 56, `Points: ${points}  |  Gold: ${gold}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: COLORS.currency as unknown as string,
    }).setOrigin(0.5);

    if (!SHOP_REGIONS.includes(store.world.currentRegion)) {
      this.add.text(width / 2, height / 2 - 20, 'No shop in this region', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: COLORS.textDim,
      }).setOrigin(0.5);
      this.createCloseButton(width / 2, height - 40);
      return;
    }

    const rowTop = 90;
    const rowHeight = 60;
    const rowPad = 8;

    SHOP_CATALOG.forEach((offer, index) => {
      const y = rowTop + index * (rowHeight + rowPad);
      this.createItemRow(width / 2 - 140, y, 280, rowHeight, offer, points);
    });

    this.createCloseButton(width / 2, height - 40);
  }

  private createItemRow(x: number, y: number, w: number, h: number, offer: TradeOffer, currentPoints: number): void {
    const canAfford = currentPoints >= offer.cost.amount;

    const bg = this.add.rectangle(x, y, w, h, COLORS.row);
    bg.setStrokeStyle(1, 0x3a3a6c);
    bg.setOrigin(0);

    const displayName = offer.itemId.replace(/_/g, ' ');
    this.add.text(x + 10, y + 8, displayName, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.text,
    });

    const costLabel = offer.cost.currency === 'points'
      ? `${offer.cost.amount} pts`
      : `${offer.cost.amount} gold`;
    this.add.text(x + 10, y + 28, `Cost: ${costLabel}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: COLORS.textDim,
    });

    const buyBtnX = x + w - 70;
    const buyBtnY = y + h / 2;
    const btnColor = canAfford ? COLORS.buy : COLORS.buyDisabled;
    const buyBg = this.add.rectangle(buyBtnX, buyBtnY, 56, 30, btnColor);
    buyBg.setOrigin(0.5);
    buyBg.setStrokeStyle(1, 0xffffff, 0.2);
    buyBg.setInteractive(canAfford ? { useHandCursor: true } : undefined);

    this.add.text(buyBtnX, buyBtnY, 'Buy', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: canAfford ? '#ffffff' : COLORS.textDim,
    }).setOrigin(0.5);

    if (canAfford) {
      buyBg.on('pointerover', () => buyBg.setAlpha(0.8));
      buyBg.on('pointerout', () => buyBg.setAlpha(1));
      buyBg.on('pointerdown', () => this.purchaseItem(offer));
    }
  }

  private purchaseItem(offer: TradeOffer): void {
    const store = useGameStore.getState();

    if (offer.cost.currency === 'points' && store.inventory.currency.points < offer.cost.amount) return;
    if (offer.cost.currency === 'gold' && store.inventory.currency.gold < offer.cost.amount) return;

    store.addItem({
      itemId: offer.itemId,
      quantity: offer.quantity,
      acquiredAt: Date.now(),
    });

    this.scene.restart();
  }

  private createCloseButton(x: number, y: number): void {
    const btn = this.add.rectangle(x, y, 160, 36, COLORS.close, 0.85);
    btn.setStrokeStyle(2, 0xffffff, 0.3);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(x, y, 'Close', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', () => {
      this.scene.stop('ShopScene');
      this.scene.resume('HubScene');
      useGameStore.getState().setCurrentScene('hub');
    });
  }
}

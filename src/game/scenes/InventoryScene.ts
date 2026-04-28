import Phaser from 'phaser';
import { useGameStore } from '../../state/useGameStore';
import type { InventoryItem } from '../../data/types/ItemTypes';

const COLS = 4;
const CELL_SIZE = 72;
const CELL_PAD = 12;
const GRID_TOP = 100;
const COLORS = {
  bg: 0x0f0e1a,
  panel: 0x16213e,
  cell: 0x1a1a3e,
  cellHover: 0x2a2a5e,
  cellBorder: 0x3a3a6c,
  text: '#b8b8d4',
  textDim: '#6c6c8c',
  food: 0x4caf50,
  training: 0xff9800,
  battle: 0xf44336,
  key: 0xffd700,
  close: 0xe74c3c,
};

export class InventoryScene extends Phaser.Scene {
  private itemCells: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'InventoryScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const store = useGameStore.getState();

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg, 0.92).setInteractive();

    this.add.text(width / 2, 40, 'Inventory', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.text(width / 2, 70, `Points: ${store.inventory.currency.points}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.textDim,
    }).setOrigin(0.5);

    const items = store.inventory.items;
    const gridLeft = (width - COLS * (CELL_SIZE + CELL_PAD) + CELL_PAD) / 2;

    items.forEach((item: InventoryItem, index: number) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = gridLeft + col * (CELL_SIZE + CELL_PAD) + CELL_SIZE / 2;
      const y = GRID_TOP + row * (CELL_SIZE + CELL_PAD) + CELL_SIZE / 2;
      const cell = this.createItemCell(x, y, item);
      this.itemCells.set(item.itemId, cell);
    });

    if (items.length === 0) {
      this.add.text(width / 2, height / 2, 'No items yet', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: COLORS.textDim,
      }).setOrigin(0.5);
    }

    this.createCloseButton(width / 2, height - 50);
  }

  private createItemCell(x: number, y: number, item: InventoryItem): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, COLORS.cell);
    bg.setStrokeStyle(2, COLORS.cellBorder);
    container.add(bg);

    const typeColor = this.getItemTypeColor(item.itemId);
    const indicator = this.add.rectangle(0, -CELL_SIZE / 2 + 6, CELL_SIZE - 8, 4, typeColor);
    container.add(indicator);

    const nameText = this.add.text(0, -8, item.itemId.substring(0, 8), {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: COLORS.text,
    }).setOrigin(0.5);
    container.add(nameText);

    const qtyText = this.add.text(0, 12, `x${item.quantity ?? 1}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.text,
    }).setOrigin(0.5);
    container.add(qtyText);

    const hitArea = this.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => bg.setFillStyle(COLORS.cellHover));
    hitArea.on('pointerout', () => bg.setFillStyle(COLORS.cell));
    hitArea.on('pointerdown', () => this.useItem(item));

    return container;
  }

  private getItemTypeColor(itemId: string): number {
    if (itemId.startsWith('food')) return COLORS.food;
    if (itemId.startsWith('train')) return COLORS.training;
    if (itemId.startsWith('battle')) return COLORS.battle;
    if (itemId.startsWith('key')) return COLORS.key;
    return COLORS.food;
  }

  private useItem(item: InventoryItem): void {
    const store = useGameStore.getState();

    if (item.itemId.startsWith('food')) {
      store.updateNeeds({ hunger: Math.min(100, store.creature.needs.hunger + 20) });
      store.removeItem(item.itemId, 1);
    } else if (item.itemId.startsWith('train')) {
      store.addStatGain('str', 1);
      store.removeItem(item.itemId, 1);
    } else if (item.itemId.startsWith('battle')) {
      store.updateNeeds({ energy: Math.min(100, store.creature.needs.energy + 15) });
      store.removeItem(item.itemId, 1);
    }

    this.scene.restart();
  }

  private createCloseButton(x: number, y: number): void {
    const btn = this.add.rectangle(x, y, 160, 44, COLORS.close, 0.85);
    btn.setStrokeStyle(2, 0xffffff, 0.3);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(x, y, 'Close', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', () => {
      this.scene.stop('InventoryScene');
      this.scene.resume('HubScene');
      useGameStore.getState().setCurrentScene('hub');
    });
  }
}

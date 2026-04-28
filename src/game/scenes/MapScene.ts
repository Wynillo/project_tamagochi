import Phaser from 'phaser';
import { useGameStore } from '@/state/useGameStore';
import type { RegionId } from '@/data/types/CommonTypes';

interface RegionNode {
  id: RegionId;
  name: string;
  description: string;
  travelTime: number;
  position: { x: number; y: number };
  connections: RegionId[];
}

const REGIONS: RegionNode[] = [
  { id: 'nursery', name: 'Nursery', description: 'A peaceful starting area for young creatures.', travelTime: 0,
    position: { x: 400, y: 460 }, connections: ['verdantThicket'] },
  { id: 'verdantThicket', name: 'Verdant Thicket', description: 'A dense forest teeming with life.', travelTime: 30,
    position: { x: 250, y: 300 }, connections: ['nursery', 'searingDunes', 'ruinsOfAethelgard'] },
  { id: 'searingDunes', name: 'Searing Dunes', description: 'Scorching sands hide ancient secrets.', travelTime: 45,
    position: { x: 550, y: 300 }, connections: ['verdantThicket', 'codeSpire'] },
  { id: 'ruinsOfAethelgard', name: 'Ruins of Aethelgard', description: 'Crumbling remnants of a lost civilization.', travelTime: 60,
    position: { x: 200, y: 150 }, connections: ['verdantThicket', 'shimmeringDeeps'] },
  { id: 'codeSpire', name: 'Code Spire', description: 'A towering structure pulsing with digital energy.', travelTime: 60,
    position: { x: 600, y: 150 }, connections: ['searingDunes', 'shimmeringDeeps'] },
  { id: 'shimmeringDeeps', name: 'Shimmering Deeps', description: 'Bioluminescent caverns beneath the world.', travelTime: 75,
    position: { x: 400, y: 80 }, connections: ['ruinsOfAethelgard', 'codeSpire'] },
];

export class MapScene extends Phaser.Scene {
  private selectedRegion: RegionId | null = null;
  private infoPanel: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'MapScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const store = useGameStore.getState();

    this.add.rectangle(0, 0, width, height, 0x0d0d1a).setOrigin(0);

    this.add.text(width / 2, 30, 'World Map', {
      fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    this.drawConnections();
    this.drawRegionNodes(store.world.currentRegion, store.world.discoveredRegions);

    const backHit = this.add.text(50, height - 30, '← Back', {
      fontSize: '16px', color: '#aaaacc',
    }).setInteractive({ useHandCursor: true });
    backHit.on('pointerdown', () => this.scene.start('HubScene'));
  }

  private drawConnections(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x444466);

    const drawn = new Set<string>();
    for (const region of REGIONS) {
      for (const connId of region.connections) {
        const key = [region.id, connId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const target = REGIONS.find(r => r.id === connId);
        if (!target) continue;

        graphics.beginPath();
        graphics.moveTo(region.position.x, region.position.y);
        graphics.lineTo(target.position.x, target.position.y);
        graphics.strokePath();
      }
    }
  }

  private drawRegionNodes(currentRegion: RegionId, discovered: RegionId[]): void {
    for (const region of REGIONS) {
      const isCurrent = region.id === currentRegion;
      const isDiscovered = discovered.includes(region.id);

      const fillColor = isCurrent ? 0xffdd57 : isDiscovered ? 0x6688cc : 0x444444;
      const radius = isCurrent ? 24 : 18;
      const alpha = isDiscovered ? 1 : 0.5;

      const circle = this.add.circle(region.position.x, region.position.y, radius, fillColor, alpha)
        .setStrokeStyle(isCurrent ? 3 : 1, isCurrent ? 0xffdd57 : 0x666688);

      if (isCurrent) {
        this.add.circle(region.position.x, region.position.y, radius + 8, 0xffdd57, 0.2);
      }

      this.add.text(region.position.x, region.position.y + radius + 8, region.name, {
        fontSize: '11px', color: isDiscovered ? '#cccccc' : '#666666',
      }).setOrigin(0.5);

      if (isDiscovered && !isCurrent) {
        circle.setInteractive({ useHandCursor: true });
        circle.on('pointerdown', () => this.showInfoPanel(region));
      }
    }
  }

  private showInfoPanel(region: RegionNode): void {
    this.destroyInfoPanel();

    const { width, height } = this.scale;
    const panelW = 300;
    const panelH = 180;
    const px = width / 2;
    const py = height / 2;

    const bg = this.add.rectangle(px, py, panelW, panelH, 0x16213e, 0.95)
      .setStrokeStyle(2, 0x6666aa);
    const nameText = this.add.text(px, py - 60, region.name, {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const descText = this.add.text(px, py - 25, region.description, {
      fontSize: '12px', color: '#aaaaaa', wordWrap: { width: panelW - 40 }, align: 'center',
    }).setOrigin(0.5);
    const travelText = this.add.text(px, py + 15, `Travel time: ${region.travelTime} min`, {
      fontSize: '14px', color: '#88aacc',
    }).setOrigin(0.5);

    const travelBtn = this.add.rectangle(px - 70, py + 55, 100, 34, 0x336644, 0.9)
      .setStrokeStyle(1, 0x44aa66);
    const travelLabel = this.add.text(px - 70, py + 55, 'Travel', {
      fontSize: '14px', color: '#44ff88',
    }).setOrigin(0.5);

    const cancelBtn = this.add.rectangle(px + 70, py + 55, 100, 34, 0x443333, 0.9)
      .setStrokeStyle(1, 0x884444);
    const cancelLabel = this.add.text(px + 70, py + 55, 'Cancel', {
      fontSize: '14px', color: '#ff8888',
    }).setOrigin(0.5);

    const travelHit = this.add.rectangle(px - 70, py + 55, 100, 34, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    travelHit.on('pointerdown', () => this.travelToRegion(region));

    const cancelHit = this.add.rectangle(px + 70, py + 55, 100, 34, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    cancelHit.on('pointerdown', () => this.destroyInfoPanel());

    this.infoPanel = this.add.container(0, 0, [
      bg, nameText, descText, travelText,
      travelBtn, travelLabel, cancelBtn, cancelLabel, travelHit, cancelHit,
    ]).setDepth(100);
  }

  private destroyInfoPanel(): void {
    if (this.infoPanel) {
      this.infoPanel.destroy(true);
      this.infoPanel = null;
    }
  }

  private travelToRegion(region: RegionNode): void {
    useGameStore.getState().advanceTime(region.travelTime);
    useGameStore.getState().setCurrentRegion(region.id);

    if (!useGameStore.getState().world.discoveredRegions.includes(region.id)) {
      useGameStore.getState().unlockRegion(region.id);
    }

    this.scene.start('HubScene');
  }
}

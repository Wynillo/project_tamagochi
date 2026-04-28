import Phaser from 'phaser';
import { useGameStore } from '@/state/useGameStore';

export class SceneTrackerPlugin extends Phaser.Plugins.BasePlugin {
  private lastKey: string = '';

  start() {
    this.game.events.on('step', this.onStep, this);
  }

  stop() {
    this.game.events.off('step', this.onStep, this);
  }

  private onStep() {
    const activeScene = this.game.scene.getScenes(true)[0];
    if (!activeScene) return;
    const key = activeScene.scene.key;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const map: Record<string, string> = {
      BootScene: 'boot',
      MainMenuScene: 'mainMenu',
      NewGameScene: 'newGame',
      HubScene: 'hub',
      CombatScene: 'combat',
      TrainingScene: 'training',
      MapScene: 'map',
      InventoryScene: 'inventory',
      CreatureScene: 'creature',
      ShopScene: 'shop',
      EventScene: 'event',
      PhaseTransitionScene: 'phaseTransition',
    };

    const sceneId = map[key];
    if (sceneId) {
      useGameStore.getState().setCurrentScene(sceneId as any);
    }
  }
}

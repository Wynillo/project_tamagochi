import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { NewGameScene } from './scenes/NewGameScene';
import { HubScene } from './scenes/HubScene';
import { CombatScene } from './scenes/CombatScene';
import { TrainingScene } from './scenes/TrainingScene';
import { MapScene } from './scenes/MapScene';
import { InventoryScene } from './scenes/InventoryScene';
import { CreatureScene } from './scenes/CreatureScene';
import { ShopScene } from './scenes/ShopScene';
import { EventScene } from './scenes/EventScene';
import { PhaseTransitionScene } from './scenes/PhaseTransitionScene';

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'phaser-game-container',
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      touch: { capture: true },
    },
    scene: [
      BootScene,
      MainMenuScene,
      NewGameScene,
      HubScene,
      CombatScene,
      TrainingScene,
      MapScene,
      InventoryScene,
      CreatureScene,
      ShopScene,
      EventScene,
      PhaseTransitionScene,
    ],
    disableContextMenu: true,
  });
}

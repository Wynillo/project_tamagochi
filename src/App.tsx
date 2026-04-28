import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from './state/useGameStore';
import { HUD } from './ui/components/HUD';
import { AwaySummaryOverlay } from './ui/overlays/AwaySummaryOverlay';
import { createGame } from './game/Game';
import type Phaser from 'phaser';

type PhaserGame = Phaser.Game;

const GAMEPLAY_SCENES = new Set(['hub', 'combat', 'training', 'map', 'inventory', 'creature', 'shop']);

export function App() {
  const gameRef = useRef<PhaserGame | null>(null);
  const [showAwaySummary, setShowAwaySummary] = useState(false);

  const lastRealTimestamp = useGameStore((s) => s.time.lastRealTimestamp);
  const creatureHistory = useGameStore((s) => s.creature.history);
  const currentScene = useGameStore((s) => s.session.currentScene);
  const showHud = GAMEPLAY_SCENES.has(currentScene);

  const awayHours = (Date.now() - lastRealTimestamp) / 3600000;
  const events = creatureHistory.map((e) => e.description);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = createGame();
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (awayHours > 0.1 && events.length > 0 && currentScene === 'hub') {
      const timer = setTimeout(() => setShowAwaySummary(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [awayHours, events.length, currentScene]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div id="phaser-game-container" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
      {showHud && <HUD />}
      {showAwaySummary && (
        <AwaySummaryOverlay
          awayHours={awayHours}
          events={events}
          onClose={() => setShowAwaySummary(false)}
        />
      )}
    </div>
  );
}

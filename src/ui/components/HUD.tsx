import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { ClockDisplay } from './ClockDisplay';
import { StatBar } from './StatBar';
import { NotificationToast } from './NotificationToast';
import { RadialMenu } from './RadialMenu';

const NEED_COLORS: Record<string, string> = {
  hunger: '#e74c3c',
  energy: '#3498db',
  mood: '#2ecc71',
  discipline: '#f1c40f',
};

export const HUD: React.FC = () => {
  const creatureName = useGameStore((s) => s.creature.name);
  const stage = useGameStore((s) => s.creature.stage);
  const needs = useGameStore((s) => s.creature.needs);
  const gameTime = useGameStore((s) => s.time.gameTime);
  const phase = useGameStore((s) => s.time.phase);
  const [showRadial, setShowRadial] = useState(false);

  const handleNav = (scene: string) => {
    window.dispatchEvent(new CustomEvent('game:navigate', { detail: scene }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <NotificationToast />

      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClockDisplay gameTime={gameTime} phase={phase} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {creatureName || '???'}
          </div>
          <div style={{ fontSize: 10, color: '#aaa', textTransform: 'capitalize' }}>
            {stage}
          </div>
        </div>

        <div style={{ minWidth: 170 }}>
          {(Object.entries(needs) as [keyof typeof NEED_COLORS, number][]).map(
            ([key, val]) => (
              <StatBar key={key} label={key} value={val} color={NEED_COLORS[key]} />
            ),
          )}
        </div>
      </div>

      <div style={{ flex: 1, pointerEvents: 'auto' }} onClick={() => setShowRadial(true)} />

      <div
        style={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px 8px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'auto',
        }}
      >
        {[
          { label: 'Inv', scene: 'inventory' },
          { label: 'Train', scene: 'training' },
          { label: 'Map', scene: 'map' },
          { label: 'Menu', scene: 'mainMenu' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleNav(btn.scene)}
            style={{
              minWidth: 52,
              minHeight: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showRadial && (
        <RadialMenu
          centerX={window.innerWidth / 2}
          centerY={window.innerHeight / 2}
          onDismiss={() => setShowRadial(false)}
        />
      )}
    </div>
  );
};

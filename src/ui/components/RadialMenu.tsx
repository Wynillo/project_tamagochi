import React, { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../state/useGameStore';

interface RadialMenuItem {
  emoji: string;
  label: string;
  action: () => void;
}

interface RadialMenuProps {
  centerX: number;
  centerY: number;
  onDismiss: () => void;
}

const RADIUS = 70;

export const RadialMenu: React.FC<RadialMenuProps> = ({ centerX, centerY, onDismiss }) => {
  const store = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const items: RadialMenuItem[] = [
    {
      emoji: '🍖',
      label: 'Feed',
      action: () => {
        store.updateNeeds({ hunger: Math.min(100, store.creature.needs.hunger + 25) });
        store.addLifeEvent({ type: 'feed', description: 'Fed the creature' });
        onDismiss();
      },
    },
    {
      emoji: '🎾',
      label: 'Play',
      action: () => {
        store.updateNeeds({ mood: Math.min(100, store.creature.needs.mood + 20) });
        store.updateNeeds({ energy: Math.max(0, store.creature.needs.energy - 10) });
        store.addLifeEvent({ type: 'play', description: 'Played with the creature' });
        onDismiss();
      },
    },
    {
      emoji: '😤',
      label: 'Scold',
      action: () => {
        store.updateNeeds({ discipline: Math.min(100, store.creature.needs.discipline + 15) });
        store.updateNeeds({ mood: Math.max(0, store.creature.needs.mood - 10) });
        store.addLifeEvent({ type: 'scold', description: 'Scolded the creature' });
        onDismiss();
      },
    },
    {
      emoji: 'ℹ️',
      label: 'Info',
      action: () => {
        window.dispatchEvent(new CustomEvent('game:show-info'));
        onDismiss();
      },
    },
  ];

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) onDismiss();
    },
    [onDismiss],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(0,0,0,0.35)',
      }}
    >
      {items.map((item, i) => {
        const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * RADIUS - 32;
        const y = centerY + Math.sin(angle) * RADIUS - 32;

        return (
          <button
            key={item.label}
            onClick={(e) => {
              e.stopPropagation();
              item.action();
            }}
            aria-label={item.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.25)',
              background: 'rgba(20,20,30,0.9)',
              color: '#fff',
              fontSize: 26,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
              animation: 'radialPop 0.2s ease-out',
            }}
          >
            <span>{item.emoji}</span>
            <span style={{ fontSize: 9, marginTop: -2 }}>{item.label}</span>
          </button>
        );
      })}
      <style>{`
        @keyframes radialPop {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

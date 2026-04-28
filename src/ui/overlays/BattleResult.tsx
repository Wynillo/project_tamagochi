import React from 'react';
import type { BattleResult as BattleResultType } from '../../data/types/CombatTypes';

interface BattleResultProps {
  result: BattleResultType;
  onContinue: () => void;
}

export const BattleResult: React.FC<BattleResultProps> = ({ result, onContinue }) => {
  const isVictory = result.winner === 'player';
  const isFled = result.winner === 'fled';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(25,25,40,0.95)',
          borderRadius: 16,
          padding: '28px 24px',
          maxWidth: 360,
          width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: isVictory ? '#2ecc71' : isFled ? '#f39c12' : '#e74c3c',
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 20,
          }}
        >
          {isVictory ? '🏆 Victory!' : isFled ? '🏃 Fled!' : '💀 Defeat'}
        </div>

        {result.rewards.length > 0 && (
          <div style={{ marginBottom: 16, textAlign: 'left', fontSize: 14, color: '#ccc' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>
              Rewards
            </div>
            {result.rewards.map((r, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                🎁 {r.itemId} ×{r.quantity}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>
          ⏱️ {result.timeSkipped} min skipped
        </div>

        {result.careMistake && (
          <div
            style={{
              fontSize: 13,
              color: '#e74c3c',
              background: 'rgba(231,76,60,0.12)',
              borderRadius: 6,
              padding: '6px 10px',
              marginBottom: 16,
            }}
          >
            ⚠️ Care Mistake recorded
          </div>
        )}

        <button
          onClick={onContinue}
          style={{
            display: 'block',
            margin: '0 auto',
            minWidth: 160,
            minHeight: 48,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10,
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

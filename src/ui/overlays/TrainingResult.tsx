import React from 'react';
import type { GameRank } from '../../data/types/CommonTypes';

interface TrainingResultProps {
  rank: GameRank;
  statGain: { stat: string; amount: number };
  fatigueIncrease: number;
  moodChange: number;
  timePassed: number;
  onContinue: () => void;
}

const RANK_COLORS: Record<GameRank, string> = {
  D: '#999',
  C: '#4ecdc4',
  B: '#3498db',
  A: '#9b59b6',
  S: '#f1c40f',
};

export const TrainingResult: React.FC<TrainingResultProps> = ({
  rank,
  statGain,
  fatigueIncrease,
  moodChange,
  timePassed,
  onContinue,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
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
            fontSize: 56,
            fontWeight: 900,
            color: RANK_COLORS[rank],
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          {rank}
        </div>

        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 18 }}>
          Training Result
        </div>

        <div style={{ textAlign: 'left', fontSize: 14, color: '#ccc', marginBottom: 20 }}>
          <div style={{ marginBottom: 6 }}>
            📈 <span style={{ textTransform: 'uppercase' }}>{statGain.stat}</span> +{statGain.amount}
          </div>
          <div style={{ marginBottom: 6 }}>
            😫 Fatigue +{fatigueIncrease}
          </div>
          <div style={{ marginBottom: 6 }}>
            {moodChange >= 0 ? '😊' : '😞'} Mood {moodChange >= 0 ? '+' : ''}{moodChange}
          </div>
          <div>
            ⏱️ {timePassed} min passed
          </div>
        </div>

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

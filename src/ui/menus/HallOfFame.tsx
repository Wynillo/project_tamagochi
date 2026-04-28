import React from 'react';
import { useGameStore, type RetiredCreature } from '../../state/useGameStore';

interface HallOfFameProps {
  onClose?: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15, 14, 26, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflowY: 'auto' as const,
    fontFamily: '"Courier New", monospace',
    zIndex: 1000,
    color: '#b8b8d4',
    padding: '1.5rem',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    border: '1px solid #3a3a6c',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '520px',
  },
  title: { fontSize: '1.3rem', color: '#e0e0ff', margin: '0 0 1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '0.8rem',
  },
  creatureCard: {
    background: '#1a1a3e',
    borderRadius: '8px',
    border: '1px solid #3a3a6c',
    padding: '0.8rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.4rem',
  },
  creatureCircle: (idx: number) => {
    const hues = ['#6c63ff', '#4caf50', '#ff9800', '#e74c3c', '#0097a7', '#7e57c2'];
    return {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: hues[idx % hues.length],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      color: '#ffffff',
    };
  },
  creatureName: { fontSize: '0.85rem', color: '#e0e0ff', textAlign: 'center' as const },
  creatureForm: { fontSize: '0.7rem', color: '#6c6c8c' },
  creatureLifespan: { fontSize: '0.7rem', color: '#6c6c8c' },
  achievements: { fontSize: '0.65rem', color: '#3a3a6c', textAlign: 'center' as const },
  empty: { textAlign: 'center' as const, padding: '2rem 0', color: '#3a3a5c', fontSize: '0.9rem' },
  closeBtn: {
    padding: '0.7rem',
    background: '#3a3a6c',
    color: '#e0e0ff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem',
  },
};

export const HallOfFame: React.FC<HallOfFameProps> = ({ onClose }) => {
  const hallOfFame = useGameStore(state => state.player.hallOfFame);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>Hall of Fame</h2>

        {hallOfFame.length === 0 ? (
          <div style={styles.empty}>No retired creatures yet</div>
        ) : (
          <div style={styles.grid}>
            {hallOfFame.map((creature: RetiredCreature, idx: number) => (
              <div key={creature.id} style={styles.creatureCard}>
                <div style={styles.creatureCircle(idx)}>
                  {creature.name.charAt(0).toUpperCase()}
                </div>
                <span style={styles.creatureName}>{creature.name}</span>
                <span style={styles.creatureForm}>
                  {creature.finalFormId || 'Unknown'}
                </span>
                <span style={styles.creatureLifespan}>
                  {creature.lifespanHours}h
                </span>
                {creature.achievements.length > 0 && (
                  <span style={styles.achievements}>
                    {creature.achievements.join(', ')}
                  </span>
                )}
                <span style={{ ...styles.achievements, color: '#2a2a4c' }}>
                  {formatDate(creature.retiredAt)}
                </span>
              </div>
            ))}
          </div>
        )}

        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default HallOfFame;

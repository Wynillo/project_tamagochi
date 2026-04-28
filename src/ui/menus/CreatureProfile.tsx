import React from 'react';
import { useGameStore } from '../../state/useGameStore';

interface CreatureProfileProps {
  onClose?: () => void;
}

const STAT_COLORS: Record<string, string> = {
  str: '#e74c3c',
  spd: '#2ecc71',
  int: '#3498db',
  sta: '#f39c12',
};

const NEED_COLORS: Record<string, string> = {
  hunger: '#ff7043',
  energy: '#ffee58',
  mood: '#ec407a',
  discipline: '#7e57c2',
};

const STAGE_ORDER = ['egg', 'baby', 'child', 'adult', 'mature', 'elder'];

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
    maxWidth: '480px',
  },
  header: { fontSize: '1.4rem', color: '#e0e0ff', margin: '0 0 0.3rem' },
  subheader: { fontSize: '0.85rem', color: '#6c6c8c', margin: '0 0 1.2rem' },
  section: { marginBottom: '1.2rem' },
  sectionTitle: { fontSize: '0.95rem', color: '#b8b8d4', marginBottom: '0.5rem', borderBottom: '1px solid #1a1a3e', paddingBottom: '0.3rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' },
  barLabel: { width: '50px', fontSize: '0.8rem', textAlign: 'right' as const },
  barTrack: { flex: 1, height: '12px', background: '#1a1a2e', borderRadius: '6px', overflow: 'hidden' },
  barFill: (pct: number, color: string) => ({ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.3s' }),
  barValue: { width: '40px', fontSize: '0.75rem', color: '#6c6c8c', textAlign: 'center' as const },
  traitList: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' },
  trait: { padding: '0.2rem 0.6rem', background: '#1a1a3e', borderRadius: '4px', fontSize: '0.75rem', color: '#6c63ff' },
  evoDots: { display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem' },
  evoDot: (active: boolean, current: boolean) => ({
    width: current ? '16px' : '12px',
    height: current ? '16px' : '12px',
    borderRadius: '50%',
    background: active ? '#6c63ff' : current ? '#8b83ff' : '#3a3a5c',
    animation: current ? 'pulse 1.5s infinite' : undefined,
  }),
  evoLabel: { fontSize: '0.65rem', color: '#6c6c8c', textAlign: 'center' as const, marginTop: '0.2rem' },
  statLine: { fontSize: '0.8rem', color: '#6c6c8c', marginBottom: '0.3rem' },
  closeBtn: {
    padding: '0.7rem',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem',
  },
};

export const CreatureProfile: React.FC<CreatureProfileProps> = ({ onClose }) => {
  const { creature } = useGameStore();

  const renderBar = (label: string, value: number, max: number, color: string) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
      <div style={styles.barRow} key={label}>
        <span style={styles.barLabel}>{label}</span>
        <div style={styles.barTrack}>
          <div style={styles.barFill(pct, color)} />
        </div>
        <span style={styles.barValue}>{Math.round(value)}</span>
      </div>
    );
  };

  const historyDepth = creature.evolution.evolutionHistory.length;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.header}>{creature.name || 'Unnamed Creature'}</h2>
        <p style={styles.subheader}>
          Stage: {creature.stage} | Species: {creature.speciesId || '???'}
        </p>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Stats</div>
          {(['str', 'spd', 'int', 'sta'] as const).map(s =>
            renderBar(s.toUpperCase(), creature.stats[s], 100, STAT_COLORS[s])
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Needs</div>
          {(['hunger', 'energy', 'mood', 'discipline'] as const).map(n =>
            renderBar(n.charAt(0).toUpperCase() + n.slice(1), creature.needs[n], 100, NEED_COLORS[n])
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Personality</div>
          {creature.personality.traits.length > 0 ? (
            <div style={styles.traitList}>
              {creature.personality.traits.map(t => (
                <span key={t} style={styles.trait}>{t}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#3a3a5c' }}>No traits yet</span>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Status</div>
          <p style={styles.statLine}>Care Mistakes: {creature.careMistakes}</p>
          <p style={styles.statLine}>Fatigue: {Math.round(creature.fatigue)}%</p>
          <p style={styles.statLine}>Battles: {creature.battlesWon}W / {creature.battlesLost}L</p>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Evolution Tree</div>
          <div style={styles.evoDots}>
            {STAGE_ORDER.map((stage, i) => (
              <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={styles.evoDot(historyDepth > i, historyDepth === i)} />
                <span style={styles.evoLabel}>{stage.substring(0, 3)}</span>
              </div>
            ))}
          </div>
          {creature.evolution.evolutionCandidates.filter(c => !c.isHidden).length > 0 && (
            <p style={{ ...styles.statLine, marginTop: '0.5rem' }}>
              Next: {creature.evolution.evolutionCandidates.filter(c => !c.isHidden).length} possible
            </p>
          )}
        </div>

        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CreatureProfile;

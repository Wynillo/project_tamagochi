import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';

interface SettingsMenuProps {
  onClose?: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15, 14, 26, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", monospace',
    zIndex: 1000,
    color: '#b8b8d4',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    border: '1px solid #3a3a6c',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: { fontSize: '1.3rem', color: '#e0e0ff', margin: '0 0 1.2rem' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 0',
    borderBottom: '1px solid #1a1a3e',
  },
  rowLabel: { fontSize: '0.9rem', color: '#b8b8d4' },
  toggle: (on: boolean) => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    background: on ? '#6c63ff' : '#3a3a6c',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background 0.2s',
    border: 'none',
  }),
  toggleKnob: (on: boolean) => ({
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: '3px',
    left: on ? '23px' : '3px',
    transition: 'left 0.2s',
  }),
  resetBtn: {
    padding: '0.6rem',
    background: '#8b3333',
    color: '#ff8888',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.85rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1.5rem',
  },
  closeBtn: {
    padding: '0.6rem',
    background: '#3a3a6c',
    color: '#e0e0ff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '0.5rem',
  },
  confirmOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  confirmCard: {
    background: '#16213e',
    borderRadius: '12px',
    border: '2px solid #e74c3c',
    padding: '1.5rem',
    maxWidth: '320px',
    textAlign: 'center' as const,
    fontFamily: '"Courier New", monospace',
    color: '#b8b8d4',
  },
  confirmText: { fontSize: '0.9rem', marginBottom: '1rem' },
  confirmBtns: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const store = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggle = (key: 'soundEnabled' | 'musicEnabled' | 'notificationsEnabled') => {
    store.updateSettings({ [key]: !store.player.settings[key] });
  };

  const ToggleSwitch: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <button style={styles.toggle(on)} onClick={onToggle}>
      <div style={styles.toggleKnob(on)} />
    </button>
  );

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={styles.title}>Settings</h2>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Sound</span>
            <ToggleSwitch on={store.player.settings.soundEnabled} onToggle={() => toggle('soundEnabled')} />
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Music</span>
            <ToggleSwitch on={store.player.settings.musicEnabled} onToggle={() => toggle('musicEnabled')} />
          </div>

          <div style={styles.row}>
            <span style={styles.rowLabel}>Notifications</span>
            <ToggleSwitch on={store.player.settings.notificationsEnabled} onToggle={() => toggle('notificationsEnabled')} />
          </div>

          <button style={styles.resetBtn} onClick={() => setShowResetConfirm(true)}>
            Reset Game
          </button>

          <button style={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmCard}>
            <p style={styles.confirmText}>
              This will erase all progress. Are you sure?
            </p>
            <div style={styles.confirmBtns}>
              <button
                style={{ ...styles.closeBtn, background: '#e74c3c', width: 'auto', padding: '0.5rem 1.2rem' }}
                onClick={() => {
                  store.resetStore();
                  setShowResetConfirm(false);
                  onClose?.();
                }}
              >
                Yes, Reset
              </button>
              <button
                style={{ ...styles.closeBtn, width: 'auto', padding: '0.5rem 1.2rem' }}
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsMenu;

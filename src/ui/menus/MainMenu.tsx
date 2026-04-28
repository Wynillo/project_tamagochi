import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';

interface MainMenuProps {
  onNewGame?: () => void;
  onContinue?: () => void;
  onOptions?: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'linear-gradient(135deg, #0f0e1a 0%, #16213e 50%, #1a1a3e 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Courier New", monospace',
    zIndex: 1000,
  },
  title: {
    fontSize: '2.4rem',
    color: '#e0e0ff',
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#6c6c8c',
    marginBottom: '3rem',
  },
  button: {
    display: 'block',
    width: '240px',
    padding: '14px 0',
    margin: '8px 0',
    background: '#1a1a3e',
    color: '#b8b8d4',
    border: '2px solid #3a3a6c',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center' as const,
  },
  buttonHover: {
    background: '#2a2a5e',
    borderColor: '#6c63ff',
    color: '#e0e0ff',
  },
};

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onContinue, onOptions }) => {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const store = useGameStore();
  const hasSave = store.creature.speciesId !== '';

  const getStyle = (id: string) => ({
    ...styles.button,
    ...(hoveredBtn === id ? styles.buttonHover : {}),
  });

  return (
    <div style={styles.overlay}>
      <h1 style={styles.title}>Digital Companion</h1>
      <p style={styles.subtitle}>A creature-raising RPG</p>

      {hasSave && (
        <button
          style={getStyle('continue')}
          onMouseEnter={() => setHoveredBtn('continue')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onContinue}
        >
          Continue
        </button>
      )}

      <button
        style={getStyle('new')}
        onMouseEnter={() => setHoveredBtn('new')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={onNewGame}
      >
        New Game
      </button>

      <button
        style={getStyle('options')}
        onMouseEnter={() => setHoveredBtn('options')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={onOptions}
      >
        Options
      </button>
    </div>
  );
};

export default MainMenu;

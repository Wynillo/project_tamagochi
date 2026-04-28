import React, { useEffect, useState } from 'react';

interface EvolutionCinematicProps {
  oldForm: string;
  newForm: string;
  onContinue: () => void;
}

export const EvolutionCinematic: React.FC<EvolutionCinematicProps> = ({
  newForm,
  onContinue,
}) => {
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowName(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {!showName ? (
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 6,
            animation: 'evoPulse 1.2s ease-in-out infinite',
          }}
        >
          EVOLVING…
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Evolved into</div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              textTransform: 'capitalize',
              animation: 'evoReveal 0.6s ease-out',
            }}
          >
            {newForm}
          </div>
          <button
            onClick={onContinue}
            style={{
              marginTop: 32,
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
      )}

      <style>{`
        @keyframes evoPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes evoReveal {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

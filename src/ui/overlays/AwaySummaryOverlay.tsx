import React from 'react';

interface AwaySummaryOverlayProps {
  awayHours: number;
  events: string[];
  onClose: () => void;
}

export const AwaySummaryOverlay: React.FC<AwaySummaryOverlayProps> = ({
  awayHours,
  events,
  onClose,
}) => {
  const hours = Math.round(awayHours * 10) / 10;

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
          maxWidth: 380,
          width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 20, textAlign: 'center' }}>
          While you were away…
        </h2>
        <p style={{ margin: '0 0 14px', fontSize: 15, color: '#bbb', textAlign: 'center' }}>
          {hours} hour{hours !== 1 ? 's' : ''} passed
        </p>

        {events.length > 0 ? (
          <ul style={{ margin: '0 0 20px', paddingLeft: 20, color: '#ccc', fontSize: 13 }}>
            {events.map((ev, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {ev}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '0 0 20px', color: '#888', fontSize: 13, textAlign: 'center' }}>
            Nothing happened.
          </p>
        )}

        <button
          onClick={onClose}
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

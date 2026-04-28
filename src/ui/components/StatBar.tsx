import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span
        style={{
          width: 62,
          fontSize: 10,
          color: '#ddd',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 100,
          height: 12,
          borderRadius: 6,
          background: '#333',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: color,
            borderRadius: 6,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#bbb', width: 30, textAlign: 'right', flexShrink: 0 }}>
        {Math.round(clamped)}%
      </span>
    </div>
  );
};

import React from 'react';
import type { TimePhase } from '../../data/types/CommonTypes';

interface ClockDisplayProps {
  gameTime: Date;
  phase: TimePhase;
}

const phaseIcon: Record<TimePhase, string> = {
  dawn: '🌅',
  day: '☀️',
  afternoon: '🌤️',
  dusk: '🌇',
  night: '🌙',
  deepNight: '🌑',
};

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ gameTime, phase }) => {
  const hours = gameTime.getHours().toString().padStart(2, '0');
  const minutes = gameTime.getMinutes().toString().padStart(2, '0');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 15, fontFamily: 'monospace', color: '#fff', letterSpacing: 1 }}>
        {hours}:{minutes}
      </span>
      <span style={{ fontSize: 16 }}>{phaseIcon[phase]}</span>
    </div>
  );
};

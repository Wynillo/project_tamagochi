import React, { useEffect, useState } from 'react';
import type { EmoteType } from '../../data/types/CommonTypes';

interface CreatureEmoteProps {
  emoteType: EmoteType;
  onDismiss?: () => void;
}

const emoteSymbol: Record<EmoteType, string> = {
  heart: '❤️',
  anger: '😡',
  zz: '💤',
  sweat: '💦',
  question: '❓',
};

export const CreatureEmote: React.FC<CreatureEmoteProps> = ({ emoteType, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '38%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 36,
        zIndex: 20,
        pointerEvents: 'none',
        animation: 'emoteFloat 2s ease-out forwards',
      }}
    >
      {emoteSymbol[emoteType]}
      <style>{`
        @keyframes emoteFloat {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          20%  { opacity: 1; transform: translate(-50%, -60%) scale(1.2); }
          40%  { opacity: 1; transform: translate(-50%, -70%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

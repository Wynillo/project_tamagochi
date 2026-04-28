import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '../../state/useGameStore';

const MAX_TOASTS = 3;
const DISMISS_MS = 4000;

export const NotificationToast: React.FC = () => {
  const notifications = useGameStore((s) => s.session.pendingNotifications);
  const clearNotification = useGameStore((s) => s.clearNotification);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      clearNotification(notifications[0].id);
    }, DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notifications, clearNotification]);

  const visible = notifications.slice(0, MAX_TOASTS);

  return (
    <div
      style={{
        position: 'fixed',
        top: 68,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        pointerEvents: 'none',
        width: 'min(340px, 90vw)',
      }}
    >
      {visible.map((n, i) => (
        <div
          key={n.id}
          onClick={() => clearNotification(n.id)}
          style={{
            background: 'rgba(20, 20, 30, 0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '8px 14px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'toastSlide 0.35s ease-out',
            opacity: 1 - i * 0.15,
          }}
        >
          <span style={{ fontSize: 11, color: '#999', marginRight: 6 }}>
            {n.type}
          </span>
          {n.message}
        </div>
      ))}
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

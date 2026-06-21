import React, { useState, useEffect, useCallback } from 'react';

const Timer = ({ timeLimit, onExpire }) => {
  const [seconds, setSeconds] = useState(timeLimit * 60);

  const handleExpire = useCallback(() => {
    onExpire();
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleExpire]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= 300;
  const isDanger = seconds <= 60;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '700',
        fontSize: '15px',
        letterSpacing: '1px',
        background: isDanger ? '#fef2f2' : isWarning ? '#fffbeb' : '#f0fdf4',
        color: isDanger ? '#dc2626' : isWarning ? '#d97706' : '#16a34a',
        border: `1px solid ${isDanger ? '#fca5a5' : isWarning ? '#fcd34d' : '#86efac'}`,
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: isDanger ? '#dc2626' : isWarning ? '#d97706' : '#16a34a',
          animation: isDanger ? 'pulse 1s infinite' : 'none',
        }}
      />
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Timer;
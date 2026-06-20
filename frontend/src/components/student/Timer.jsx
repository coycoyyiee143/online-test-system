import React, { useState, useEffect } from 'react';

const Timer = ({ timeLimit, onExpire }) => {
  const [seconds, setSeconds] = useState(timeLimit * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= 300; // 5 minutes warning
  const isDanger = seconds <= 60; // 1 minute danger

  return (
    <div className={`badge fs-5 p-2 ${isDanger ? 'bg-danger' : isWarning ? 'bg-warning text-dark' : 'bg-success'}`}>
      ⏱ {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
};

export default Timer;
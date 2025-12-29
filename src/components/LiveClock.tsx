import React, { useState, useEffect } from 'react';

export const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <span className="live-dot" />
      <span className="text-muted-foreground">
        {time.toLocaleTimeString('ar-DZ', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
        })}
      </span>
    </div>
  );
};

import React from 'react';

interface LiveIndicatorProps {
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="live-dot" />
      <span className="text-xs font-semibold text-success animate-pulse">LIVE</span>
    </div>
  );
};

export const LiveDot: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };
  
  return (
    <span className={`${sizeClasses[size]} rounded-full bg-success animate-pulse-live inline-block`} />
  );
};

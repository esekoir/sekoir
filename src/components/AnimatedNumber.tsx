import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  direction?: 'up' | 'down' | 'stable';
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  direction = 'stable',
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      
      // Animate counting
      const diff = value - prevValue.current;
      const steps = 10;
      const stepValue = diff / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          setDisplayValue(prev => prev + stepValue);
        }
      }, 30);
      
      prevValue.current = value;
      
      return () => clearInterval(interval);
    }
  }, [value]);

  const directionClass = direction === 'up' 
    ? 'text-success' 
    : direction === 'down' 
      ? 'text-destructive' 
      : '';

  const animationClass = isAnimating 
    ? direction === 'up' 
      ? 'price-up' 
      : direction === 'down' 
        ? 'price-down' 
        : ''
    : '';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <span 
      className={`
        inline-block transition-all duration-200 rounded px-1
        ${directionClass} 
        ${animationClass}
        ${isAnimating ? 'animate-number-pop' : ''}
        ${className}
      `}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export const formatNumberWithCommas = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

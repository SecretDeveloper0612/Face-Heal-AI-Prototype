// components/ui/ProgressBar.tsx

import React from 'react';
import { ProgressBarProps } from '../../types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  color = 'text-emerald-400',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          stroke="#4a4a4a" // Background stroke color
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color}`} // Tailwind color class for progress stroke
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease-in-out' }}
        />
      </svg>
      {label && (
        <span className="absolute text-2xl font-bold text-white">
          {label}
        </span>
      )}
      <span className="absolute text-xl font-bold text-white" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default ProgressBar;

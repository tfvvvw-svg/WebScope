import React, { useEffect, useState } from 'react';

interface GaugeChartProps {
  score: number;
  title: string;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ score, title, size = 100 }) => {
  const [offset, setOffset] = useState(0);
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progressOffset = circumference - (score / 100) * circumference;
    const timer = setTimeout(() => setOffset(progressOffset), 150);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getColorClass = (value: number) => {
    if (value >= 90) return { stroke: 'stroke-emerald-400', text: 'text-emerald-300', glow: 'rgba(52, 211, 153, 0.6)' };
    if (value >= 50) return { stroke: 'stroke-fuchsia-400', text: 'text-fuchsia-300', glow: 'rgba(232, 121, 249, 0.6)' };
    return { stroke: 'stroke-rose-400', text: 'text-rose-300', glow: 'rgba(251, 113, 133, 0.6)' };
  };

  const themeColors = getColorClass(score);

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center group">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Spinning gradient background */}
        <div className="absolute inset-2 rounded-full opacity-30 blur-xl animate-spin-slow" style={{
          background: `conic-gradient(from 0deg, ${themeColors.glow}, transparent, ${themeColors.glow})`
        }} />

        <svg className="transform -rotate-90 w-full h-full relative z-10">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800/80"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${themeColors.stroke} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${themeColors.glow})`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center z-10">
          <span className={`text-2xl font-bold tracking-tight ${themeColors.text} text-glow`}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-zinc-300 mt-3.5 tracking-wide uppercase group-hover:text-fuchsia-300 transition-colors">
        {title}
      </span>
    </div>
  );
};

export default GaugeChart;

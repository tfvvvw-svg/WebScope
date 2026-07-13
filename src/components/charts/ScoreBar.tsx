import React, { useEffect, useState } from 'react';

interface ScoreBarProps {
  label: string;
  score: number;
  showValue?: boolean;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, showValue = true }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const getColors = (val: number) => {
    if (val >= 90) return { bg: 'bg-gradient-to-r from-emerald-500 to-cyan-500', text: 'text-emerald-300', glow: 'shadow-emerald-500/50' };
    if (val >= 70) return { bg: 'bg-gradient-to-r from-fuchsia-500 to-purple-500', text: 'text-fuchsia-300', glow: 'shadow-fuchsia-500/50' };
    if (val >= 50) return { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-amber-300', glow: 'shadow-amber-500/50' };
    return { bg: 'bg-gradient-to-r from-rose-500 to-pink-500', text: 'text-rose-300', glow: 'shadow-rose-500/50' };
  };

  const colors = getColors(score);

  return (
    <div className="w-full flex flex-col gap-2 group">
      <div className="flex justify-between items-center text-xs font-semibold tracking-wide">
        <span className="text-zinc-300 uppercase group-hover:text-white transition-colors">{label}</span>
        {showValue && <span className={`${colors.text} font-mono`}>{score} / 100</span>}
      </div>
      <div className="relative h-2 w-full bg-zinc-900/80 rounded-full overflow-hidden border border-fuchsia-500/20">
        <div
          className={`h-full ${colors.bg} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${width}%`, boxShadow: `0 0 12px currentColor` }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default ScoreBar;

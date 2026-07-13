import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  glow = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-all duration-300';

  const variants = {
    default: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    purple: 'bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 text-fuchsia-300 border border-fuchsia-500/30'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glow ? 'shadow-lg' : ''} ${className}`}
      style={glow ? { boxShadow: '0 0 15px currentColor' } : {}}
      {...(props as any)}
    >
      {children}
    </motion.span>
  );
};

export default Badge;

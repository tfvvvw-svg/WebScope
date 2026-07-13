import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'borderless';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-400';

  const variants = {
    default: 'bg-zinc-950/60 border border-fuchsia-500/15 shadow-xl shadow-fuchsia-500/5',
    glass: 'glass-card shadow-2xl shadow-fuchsia-500/5',
    borderless: 'bg-transparent border-0 shadow-none'
  };

  const hoverStyles = hoverable && variant !== 'borderless'
    ? 'hover:border-fuchsia-400/50 hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-1.5'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-5 border-b border-fuchsia-500/10 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-base font-semibold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-zinc-400 mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-fuchsia-500/10 flex items-center justify-end gap-2 bg-black/30 rounded-b-2xl ${className}`} {...props}>
    {children}
  </div>
);

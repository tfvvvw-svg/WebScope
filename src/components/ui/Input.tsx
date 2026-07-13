import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, startIcon, endIcon, className = '', ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex flex-col gap-1.5 text-left"
      >
        {label && (
          <label className="text-xs font-medium text-zinc-300 px-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center group">
          {startIcon && (
            <div className="absolute left-4 text-zinc-400 pointer-events-none flex items-center justify-center group-focus-within:text-fuchsia-400 transition-colors">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full text-sm py-3 rounded-xl border transition-all duration-300 glass-input
              ${startIcon ? 'pl-11' : 'pl-4'}
              ${endIcon ? 'pr-11' : 'pr-4'}
              ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-fuchsia-500/20 focus:border-fuchsia-400 focus:ring-fuchsia-500/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-fuchsia-500/40
              ${className}
            `}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-4 text-zinc-400 pointer-events-none flex items-center justify-center">
              {endIcon}
            </div>
          )}

          {/* Subtle glow underline on focus */}
          <span className="absolute bottom-0 left-1/2 w-0 h-px bg-gradient-to-r from-fuchsia-500 to-cyan-500 group-focus-within:w-full group-focus-within:left-0 transition-all duration-500" />
        </div>
        {error && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-rose-400 px-1 mt-0.5 flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-rose-400 rounded-full animate-pulse" />
            {error}
          </motion.span>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

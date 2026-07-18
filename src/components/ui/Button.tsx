import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "ref"
> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-500/30 focus:ring-fuchsia-500",
    secondary:
      "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 border border-fuchsia-500/20 focus:ring-fuchsia-500",
    outline:
      "border border-fuchsia-500/40 hover:border-fuchsia-400 text-fuchsia-300 hover:text-fuchsia-200 hover:bg-fuchsia-500/10 focus:ring-fuchsia-500",
    ghost:
      "hover:bg-fuchsia-500/10 text-zinc-400 hover:text-fuchsia-300 focus:ring-fuchsia-500",
    danger:
      "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/30 focus:ring-rose-500",
    glass:
      "glass-panel hover:bg-fuchsia-500/10 text-white border-fuchsia-500/20 hover:border-fuchsia-400/50 focus:ring-fuchsia-500",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.04 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {variant === "primary" && !disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      )}
      {loading && (
        <span
          className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex items-center">{children}</span>
    </motion.button>
  );
};

export default Button;

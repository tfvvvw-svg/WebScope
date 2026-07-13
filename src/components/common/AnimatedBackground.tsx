import React, { useMemo, useEffect, useState } from "react";

// Pre-compute star positions to avoid Math.random on every render
const STARS = Array.from({ length: 25 }, (_, i) => ({
  key: i,
  top: `${(i * 7 + 3) % 100}%`,
  left: `${(i * 13 + 7) % 100}%`,
  delay: `${(i * 0.12) % 3}s`,
  duration: `${2 + (i % 4)}s`,
  opacity: 0.2 + (i % 5) * 0.1,
}));

export const AnimatedBackground: React.FC = () => {
  const stars = useMemo(() => STARS, []);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-animated opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] opacity-80" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated grid - GPU accelerated */}
      <div className="absolute inset-0 bg-grid-animated opacity-50 will-change-transform" />

      {/* Gradient blobs - GPU accelerated with transform only */}
      <div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-fuchsia-600/20 blur-[120px] rounded-full animate-blob will-change-transform"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-cyan-500/15 blur-[140px] rounded-full animate-blob will-change-transform"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full animate-blob will-change-transform"
        style={{ animationDelay: "8s" }}
      />
      {/* Twinkling stars - pre-computed positions */}
      {stars.map((star) => (
        <div
          key={star.key}
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle will-change-transform"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Scanning line - GPU accelerated */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent animate-scan-line will-change-transform"
          style={{ animationDuration: "6s" }}
        />
      </div>

      {/* Top vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] opacity-80" />
    </div>
  );
};

export default AnimatedBackground;

import React from "react";

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid-animated opacity-50" />

      {/* Gradient blobs */}
      <div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-fuchsia-600/20 blur-[120px] rounded-full animate-blob"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-cyan-500/15 blur-[140px] rounded-full animate-blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full animate-blob"
        style={{ animationDelay: "8s" }}
      />

      {/* Twinkling stars */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
            opacity: Math.random() * 0.6 + 0.2,
          }}
        />
      ))}

      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent animate-scan-line"
          style={{ animationDuration: "6s" }}
        />
      </div>

      {/* Top vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] opacity-80" />
    </div>
  );
};

export default AnimatedBackground;

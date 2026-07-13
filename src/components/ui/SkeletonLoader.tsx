import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-zinc-800/60 rounded-xl';
  
  const variants = {
    text: 'h-4 w-3/4 rounded',
    rect: 'w-full h-24',
    circle: 'rounded-full'
  };

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width="30%" height={12} />
      </div>
    </div>
    <Skeleton variant="rect" height={100} />
    <div className="flex justify-between gap-4">
      <Skeleton variant="text" width="20%" height={12} />
      <Skeleton variant="text" width="40%" height={12} />
    </div>
  </div>
);

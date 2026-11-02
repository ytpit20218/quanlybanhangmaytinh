// ==========================================
// MATERIAL 3 BADGE COMPONENT
// Specs: https://m3.material.io/components/badges
// ==========================================

import React from 'react';

export interface M3BadgeProps {
  content?: number | string;
  dot?: boolean;
  color?: 'error' | 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

export const M3Badge: React.FC<M3BadgeProps> = ({
  content,
  dot = false,
  color = 'error',
  className = '',
  children,
}) => {
  let colorStyle = 'bg-m3-error text-m3-on-error';
  if (color === 'primary') colorStyle = 'bg-m3-primary text-m3-on-primary';
  if (color === 'secondary') colorStyle = 'bg-m3-secondary text-m3-on-secondary';

  const badgeElement = dot ? (
    <span
      className={`w-2 h-2 rounded-full ${colorStyle} ${className}`}
    />
  ) : (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold leading-none rounded-full ${colorStyle} ${className}`}
    >
      {content}
    </span>
  );

  if (!children) return badgeElement;

  return (
    <div className="relative inline-flex items-center">
      {children}
      <span className="absolute -top-1 -right-1 pointer-events-none">
        {badgeElement}
      </span>
    </div>
  );
};

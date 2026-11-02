// ==========================================
// MATERIAL 3 CARD COMPONENT
// Variants: elevated, filled, outlined
// Specs: https://m3.material.io/components/cards
// ==========================================

import React from 'react';

export type M3CardVariant = 'elevated' | 'filled' | 'outlined';

export interface M3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: M3CardVariant;
  interactive?: boolean;
}

export const M3Card: React.FC<M3CardProps> = ({
  variant = 'outlined',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  let variantStyle = '';
  switch (variant) {
    case 'elevated':
      variantStyle = 'bg-m3-surface-container-low shadow-sm ' + (interactive ? 'hover:shadow-md hover:bg-m3-surface-container cursor-pointer transition-all ' : '');
      break;
    case 'filled':
      variantStyle = 'bg-m3-surface-container-highest ' + (interactive ? 'hover:bg-m3-surface-container-high cursor-pointer transition-all ' : '');
      break;
    case 'outlined':
    default:
      variantStyle = 'bg-m3-surface border border-m3-outline-variant ' + (interactive ? 'hover:border-m3-primary hover:shadow-xs cursor-pointer transition-all ' : '');
      break;
  }

  return (
    <div
      className={`rounded-m3-md overflow-hidden text-m3-on-surface ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

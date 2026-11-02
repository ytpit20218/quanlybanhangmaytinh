// ==========================================
// MATERIAL 3 CHIP COMPONENT
// Variants: filter, assist, suggestion
// Specs: https://m3.material.io/components/chips
// ==========================================

import React from 'react';
import { Check } from 'lucide-react';

export interface M3ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  selected = false,
  icon,
  onRemove,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-m3-sm text-xs font-medium transition-all select-none border ${
        selected
          ? 'bg-m3-secondary-container border-transparent text-m3-on-secondary-container font-semibold shadow-xs'
          : 'bg-m3-surface border-m3-outline-variant text-m3-on-surface-variant hover:bg-m3-surface-container-low hover:text-m3-on-surface'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {selected ? (
        <Check className="w-3.5 h-3.5 text-m3-on-secondary-container" />
      ) : (
        icon && <span className="text-m3-on-surface-variant">{icon}</span>
      )}
      <span>{children}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-m3-on-surface-variant hover:text-m3-on-surface font-bold text-sm"
        >
          ×
        </span>
      )}
    </button>
  );
};

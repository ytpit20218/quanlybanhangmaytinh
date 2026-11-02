// ==========================================
// MATERIAL 3 BUTTON COMPONENT
// Variants: filled, outlined, tonal, elevated, text
// Specs: https://m3.material.io/components/buttons
// ==========================================

import React from 'react';

export type M3ButtonVariant = 'filled' | 'outlined' | 'tonal' | 'elevated' | 'text';
export type M3ButtonSize = 'sm' | 'md' | 'lg';

export interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  size?: M3ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  icon,
  trailingIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base M3 button styling: rounded-full (pill), state layer on hover, transitions
  let baseStyle = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-m3-full disabled:cursor-not-allowed ';

  // Size specifications per M3
  let sizeStyle = '';
  if (size === 'sm') {
    sizeStyle = 'text-xs h-8 px-3.5 gap-1.5 ';
  } else if (size === 'lg') {
    sizeStyle = 'text-sm h-11 px-6 gap-2.5 ';
  } else {
    // md: standard 40px height
    sizeStyle = 'text-xs sm:text-sm h-10 px-5 gap-2 ';
  }

  // Variant specifications
  let variantStyle = '';
  switch (variant) {
    case 'filled':
      variantStyle = disabled
        ? 'bg-slate-200 text-slate-400 '
        : 'bg-m3-primary text-m3-on-primary hover:bg-[#00548f] hover:shadow-sm active:bg-[#00477b] shadow-xs ';
      break;

    case 'outlined':
      variantStyle = disabled
        ? 'border border-slate-200 text-slate-400 bg-transparent '
        : 'border border-m3-outline text-m3-primary bg-transparent hover:bg-m3-primary/8 active:bg-m3-primary/12 ';
      break;

    case 'tonal':
      variantStyle = disabled
        ? 'bg-slate-100 text-slate-400 '
        : 'bg-m3-secondary-container text-m3-on-secondary-container hover:bg-[#c9d8f0] active:bg-[#bccde7] ';
      break;

    case 'elevated':
      variantStyle = disabled
        ? 'bg-slate-100 text-slate-400 shadow-none '
        : 'bg-m3-surface-container-low text-m3-primary shadow-xs hover:shadow-md hover:bg-m3-surface-container active:shadow-xs ';
      break;

    case 'text':
      variantStyle = disabled
        ? 'text-slate-400 bg-transparent '
        : 'text-m3-primary bg-transparent hover:bg-m3-primary/8 active:bg-m3-primary/12 ';
      break;
  }

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
    </button>
  );
};

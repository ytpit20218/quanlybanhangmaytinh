// ==========================================
// MATERIAL 3 TEXT FIELD COMPONENT
// Clean, accessible, modern retail input with top label & icons
// ==========================================

import React, { useState, useEffect, useRef } from 'react';

export interface M3TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'outlined' | 'filled';
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
}

export const M3TextField: React.FC<M3TextFieldProps> = ({
  label,
  variant = 'outlined',
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingIconClick,
  id,
  value,
  defaultValue,
  placeholder,
  className = '',
  disabled,
  required,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (value !== undefined && value !== null) return String(value);
    if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue);
    return '';
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const hasError = !!error;
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value !== null && value !== undefined ? String(value) : '');
    }
  }, [value, isControlled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (inputRef.current && !isControlled) {
      setInternalValue(inputRef.current.value);
    }
    onBlur?.(e);
  };

  return (
    <div className={`w-full text-left ${className}`}>
      {/* 1. Label clearly positioned above input */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}

      {/* 2. Input container with icons and placeholder */}
      <div className="relative">
        {leadingIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center z-10">
            {leadingIcon}
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          value={isControlled ? value : internalValue}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full text-xs sm:text-sm font-sans transition-all duration-150 outline-none bg-white border rounded-lg py-2.5 sm:py-3 ${
            hasError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-900'
              : isFocused
              ? 'border-[#00B8D9] ring-2 ring-[#00B8D9]/20 text-slate-900'
              : 'border-slate-300 hover:border-slate-400 text-slate-900'
          } ${leadingIcon ? 'pl-10 sm:pl-11' : 'pl-3.5'} ${
            trailingIcon ? 'pr-10 sm:pr-11' : 'pr-3.5'
          } placeholder:text-slate-400 ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
          }`}
          {...props}
        />

        {trailingIcon && (
          <div
            onClick={onTrailingIconClick}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center z-10 ${
              onTrailingIconClick ? 'cursor-pointer hover:text-slate-600' : 'pointer-events-none'
            }`}
          >
            {trailingIcon}
          </div>
        )}
      </div>

      {/* 3. Helper text / Error text */}
      {(error || helperText) && (
        <div className="mt-1.5 px-0.5 text-[11px] leading-tight">
          {error ? (
            <span className="text-rose-600 font-medium">{error}</span>
          ) : (
            <span className="text-slate-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};

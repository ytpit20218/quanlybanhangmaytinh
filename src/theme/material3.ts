// ==========================================
// GOOGLE MATERIAL 3 (MATERIAL YOU) DESIGN TOKENS
// Anchored to COMPUTERTECH Brand Identity
// Primary Navy: #14213D | Secondary Cyan: #00B8D9 | Accent Coral: #FF7043
// ==========================================

export const M3_COLORS = {
  // Brand Anchored Core Roles
  primary: '#14213D',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D7E3F7',
  onPrimaryContainer: '#0A1325',

  secondary: '#00B8D9',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E0F7FA',
  onSecondaryContainer: '#003640',

  tertiary: '#FF7043',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFECE5',
  onTertiaryContainer: '#421405',

  // Semantic Status
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#450A0A',
  success: '#16A34A',
  warning: '#F59E0B',

  // Surfaces & Hierarchy
  surface: '#FFFFFF',
  onSurface: '#172033',
  surfaceVariant: '#F1F5F9',
  onSurfaceVariant: '#64748B',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',

  // Surface Tonal Containers
  surfaceDim: '#E2E8F0',
  surfaceBright: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainer: '#F5F7FA',
  surfaceContainerHigh: '#EEF2F6',
  surfaceContainerHighest: '#E2E8F0',
} as const;

export const M3_TYPOGRAPHY = {
  displayLarge: 'text-[57px] leading-[64px] tracking-[-0.25px] font-normal',
  displayMedium: 'text-[45px] leading-[52px] tracking-[0px] font-normal',
  displaySmall: 'text-[36px] leading-[44px] tracking-[0px] font-normal',
  headlineLarge: 'text-[32px] leading-[40px] tracking-[0px] font-bold',
  headlineMedium: 'text-[28px] leading-[36px] tracking-[0px] font-bold',
  headlineSmall: 'text-[24px] leading-[32px] tracking-[0px] font-bold',
  titleLarge: 'text-[20px] leading-[28px] tracking-[0px] font-semibold',
  titleMedium: 'text-[16px] leading-[24px] tracking-[0.15px] font-semibold',
  titleSmall: 'text-[14px] leading-[20px] tracking-[0.1px] font-semibold',
  bodyLarge: 'text-[16px] leading-[24px] tracking-[0.5px] font-normal',
  bodyMedium: 'text-[14px] leading-[20px] tracking-[0.25px] font-normal',
  bodySmall: 'text-[12px] leading-[16px] tracking-[0.4px] font-normal',
  labelLarge: 'text-[14px] leading-[20px] tracking-[0.1px] font-medium',
  labelMedium: 'text-[12px] leading-[16px] tracking-[0.5px] font-medium',
  labelSmall: 'text-[11px] leading-[16px] tracking-[0.5px] font-medium',
} as const;

export const M3_SHAPE = {
  none: 'rounded-none',
  extraSmall: 'rounded-[4px]',
  small: 'rounded-[8px]',
  medium: 'rounded-[12px]',
  large: 'rounded-[16px]',
  extraLarge: 'rounded-[24px]',
  full: 'rounded-full',
} as const;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // COMPUTERTECH Official Retail Brand Palette
        navy: {
          primary: '#14213D',
          dark: '#0B132B',
          light: '#1F2E4D',
          hover: '#0E172B',
        },
        cyan: {
          secondary: '#00B8D9',
          dark: '#008BA3',
          light: '#E6F8FB',
          hover: '#00A3C2',
        },
        coral: {
          accent: '#FF7043',
          dark: '#E65100',
          light: '#FFECE5',
          hover: '#F4511E',
        },

        // Retail Surface & Text System
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F5F7FA',
          subtle: '#F8FAFC',
          muted: '#F1F5F9',
        },
        content: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        line: {
          DEFAULT: '#E2E8F0',
          subtle: '#EEF2F6',
          strong: '#CBD5E1',
        },
        status: {
          success: '#16A34A',
          'success-bg': '#F0FDF4',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          error: '#DC2626',
          'error-bg': '#FEF2F2',
          info: '#0284C7',
          'info-bg': '#F0F9FF',
        },

        // Material 3 Semantic Color System
        m3: {
          primary: '#14213D', // Anchored to brand Navy
          'on-primary': '#FFFFFF',
          'primary-container': '#D7E3F7',
          'on-primary-container': '#0A1325',

          secondary: '#00B8D9', // Anchored to brand Cyan
          'on-secondary': '#FFFFFF',
          'secondary-container': '#E0F7FA',
          'on-secondary-container': '#003640',

          tertiary: '#FF7043', // Anchored to brand Coral
          'on-tertiary': '#FFFFFF',
          'tertiary-container': '#FFECE5',
          'on-tertiary-container': '#421405',

          error: '#DC2626',
          'on-error': '#FFFFFF',
          'error-container': '#FEE2E2',
          'on-error-container': '#450A0A',

          surface: '#FFFFFF',
          'on-surface': '#172033',
          'surface-variant': '#F1F5F9',
          'on-surface-variant': '#64748B',
          outline: '#CBD5E1',
          'outline-variant': '#E2E8F0',

          // Surface Tonal Elevation Containers
          'surface-dim': '#E2E8F0',
          'surface-bright': '#FFFFFF',
          'surface-container-lowest': '#FFFFFF',
          'surface-container-low': '#F8FAFC',
          'surface-container': '#F5F7FA',
          'surface-container-high': '#EEF2F6',
          'surface-container-highest': '#E2E8F0',
        },

        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#14213d',
          950: '#0b132b',
        },
      },
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '24px',
        'm3-2xl': '28px',
        'm3-full': '9999px',
      },
      fontFamily: {
        sans: ['"Inter"', '"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(20, 33, 61, 0.05)',
        'card': '0 2px 8px rgba(20, 33, 61, 0.06)',
        'card-hover': '0 8px 24px rgba(20, 33, 61, 0.12)',
        'dropdown': '0 10px 30px rgba(20, 33, 61, 0.15)',
      }
    },
  },
  plugins: [],
}

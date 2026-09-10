/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7f1',
          100: '#d5ecde',
          200: '#aed9be',
          300: '#7dc19a',
          400: '#4da678',
          500: '#2d8a5a',
          600: '#1a6e45',
          700: '#155637',
          800: '#124529',
          900: '#0f3720',
          950: '#081f12',
        },
        // Semantic text scale — replaces ad-hoc hex values and dark slate tones.
        ink: {
          900: '#12261a',
          800: '#1a3825',
          700: '#33513f',
          600: '#4a6b55',
          500: '#6b8a76',
          400: '#7a9a83',
        },
        // Surfaces and hairlines.
        canvas: '#f4f7f5',
        line: {
          DEFAULT: '#e2ece5',
          strong: '#cddcd3',
        },
        surface: {
          50:  '#f7faf8',
          100: '#eef3f0',
          200: '#dfe9e3',
          300: '#c7d8cd',
          400: '#8eaf99',
          500: '#6e9279',
          600: '#567661',
          700: '#455f4e',
          800: '#394e41',
          900: '#2f4036',
        },
        pci: {
          excellent: '#16a34a',
          good:      '#65a30d',
          fair:      '#d97706',
          poor:      '#ea580c',
          critical:  '#dc2626',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        // iOS-like type ramp: [size, { lineHeight, letterSpacing }]
        caption: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        footnote: ['0.75rem', { lineHeight: '1.125rem' }],
        subhead: ['0.8125rem', { lineHeight: '1.25rem' }],
        body: ['0.9375rem', { lineHeight: '1.5rem' }],
        headline: ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        title3: ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '-0.015em' }],
        title2: ['1.5rem', { lineHeight: '1.875rem', letterSpacing: '-0.02em' }],
        title1: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.022em' }],
        display: ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      },
      spacing: {
        // 4/8 rhythm extensions used by the app shell.
        18: '4.5rem',
        22: '5.5rem',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        subtle:   '0 1px 2px rgba(15, 55, 32, 0.05)',
        card:     '0 1px 2px rgba(15, 55, 32, 0.04), 0 4px 16px -8px rgba(15, 55, 32, 0.10)',
        elevated: '0 8px 32px -12px rgba(15, 55, 32, 0.18), 0 2px 8px -4px rgba(15, 55, 32, 0.08)',
        'card-hover': '0 2px 4px rgba(15, 55, 32, 0.05), 0 12px 28px -12px rgba(15, 55, 32, 0.16)',
        sheet:    '0 -8px 32px -12px rgba(15, 55, 32, 0.22)',
        nav:      '0 -1px 0 rgba(15, 55, 32, 0.06)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      transitionTimingFunction: {
        // Short, restrained motion — iOS-like easing.
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.22s cubic-bezier(0.32, 0.72, 0, 1) both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.32, 0.72, 0, 1) both',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

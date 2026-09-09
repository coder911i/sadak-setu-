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
        surface: {
          50:  '#f4f7f5',
          100: '#eaf0ec',
          200: '#d4e3d8',
          300: '#b5ccbc',
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
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle':   '0 1px 3px 0 rgba(15, 55, 32, 0.06), 0 1px 2px -1px rgba(15, 55, 32, 0.04)',
        'card':     '0 2px 8px rgba(15, 55, 32, 0.08), 0 1px 3px rgba(15, 55, 32, 0.05)',
        'elevated': '0 8px 24px -4px rgba(15, 55, 32, 0.12), 0 4px 8px -2px rgba(15, 55, 32, 0.06)',
        'card-hover': '0 6px 20px rgba(15, 55, 32, 0.12), 0 2px 8px rgba(15, 55, 32, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf7ff',
          100: '#f5f0ff',
          200: '#e9d5ff',
          300: '#c084fc',
          400: '#a855f7',
          500: '#7c3aed',
          600: '#5b2d9e',
          700: '#3d1a6e',
          800: '#2d1354',
          900: '#1e0a3c',
        },
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

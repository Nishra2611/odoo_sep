/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10151F',
          soft: '#161D2A',
        },
        slate: {
          panel: '#1E2A3A',
          line: '#2A3648',
        },
        canvas: {
          DEFAULT: '#F7F8FA',
          dark: '#0B0F17',
        },
        signal: {
          DEFAULT: '#F5A623',
          dim: '#B97A15',
          soft: '#FDECD1',
        },
        route: {
          DEFAULT: '#2F6FED',
          soft: '#E4EDFD',
        },
        alert: {
          DEFAULT: '#E5484D',
          soft: '#FBE3E3',
        },
        go: {
          DEFAULT: '#2FB67C',
          soft: '#E1F5EB',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 21, 31, 0.06), 0 1px 1px rgba(16, 21, 31, 0.04)',
        panel: '0 4px 24px rgba(16, 21, 31, 0.35)',
      },
      keyframes: {
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        ticker: 'ticker 28s linear infinite',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}

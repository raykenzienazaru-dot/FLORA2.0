/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flora: {
          'forest': '#173D2B',
          'deep': '#0F2F22',
          'primary': '#2F6F45',
          'medium': '#5F9E52',
          'accent': '#A8D65A',
          'warm-white': '#F7F8F4',
          'soft-white': '#EEF3EC',
          'card': '#FFFFFF',
          'dark-surface': '#102019',
          'text': '#17221B',
          'text-secondary': '#69756C',
          'text-muted': '#98A39B',
        },
        status: {
          healthy: {
            bg: '#EAF4E8',
            text: '#22531A',
            border: '#C4E1BF',
            dot: '#367C29',
          },
          moderate: {
            bg: '#FEF7E8',
            text: '#8A570C',
            border: '#FDE3B5',
            dot: '#D97706',
          },
          high: {
            bg: '#FEEAEA',
            text: '#961C1C',
            border: '#FCCECE',
            dot: '#DC2626',
          },
          powdery: {
            bg: '#FFF3E6',
            text: '#9E450E',
            border: '#FDD8B3',
            dot: '#EA580C',
          },
          rust: {
            bg: '#FAF0EB',
            text: '#852F17',
            border: '#F5D2C5',
            dot: '#B43E1F',
          },
        }
      },
      boxShadow: {
        flora: '0 2px 10px rgba(30, 40, 5, 0.04)',
        'flora-md': '0 4px 16px rgba(30, 40, 5, 0.07)',
        'flora-lg': '0 8px 24px rgba(30, 40, 5, 0.09)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};

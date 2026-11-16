import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    extend: {
      colors: {
        vinho: { DEFAULT: '#8D2525', 700: '#6E1B1B', 900: '#3D0E0E', 300: '#C46A6A' },
        grafite: { DEFAULT: '#202020', 800: '#2A2A2A', 700: '#343434', 600: '#4A4A4A', 400: '#8A8A8A' },
        offwhite: '#F5F3EF',
        ambar: { DEFAULT: '#E5A12E', logo: '#F09702', 700: '#A86A06' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Escala modular 1.25 (terça maior), ajustada por clamp para mobile-first
        'giga': ['clamp(3rem, 9.4vw, 9.5rem)', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
        'mega': ['clamp(2.6rem, 6.4vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'h1': ['clamp(2.25rem, 5.2vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'h2': ['clamp(1.85rem, 3.6vw, 3.1rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'h3': ['clamp(1.25rem, 1.8vw, 1.6rem)', { lineHeight: '1.18', letterSpacing: '-0.015em' }],
        'lead': ['clamp(1.05rem, 1.35vw, 1.25rem)', { lineHeight: '1.6' }],
        'label': ['0.72rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
      },
      maxWidth: { wrap: '1360px', prose: '68ch' },
      transitionTimingFunction: { out: 'cubic-bezier(.16,1,.3,1)' },
    },
  },
  plugins: [],
} satisfies Config;

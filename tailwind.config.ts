import type { Config } from 'tailwindcss';

/**
 * ProductHub Admin design tokens — same brand palette as the main
 * ProductHub app (tailwind.config.ts there), extended with the few extra
 * semantic colors the FlowDesk "Admin Ops Center" design calls for
 * (warning, neutral chips, a brighter accent for progress bars) that the
 * customer-facing app never needed.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        canvas: '#F7F7F5',
        canvas2: '#E6E5E1',
        surface: '#FFFFFF',
        hairline: '#E2E1DC',
        borderStrong: '#C7C6C0',
        label: '#8A8983',
        body: '#565B66',
        faint: '#ADACA6',
        ink: '#1B2A4A',
        accent: {
          DEFAULT: '#2367A9',
          bg: '#EAF1FB',
          bright: '#378ADD',
        },
        success: { DEFAULT: '#1D9E75', bg: '#E5F4EE', text: '#14795C' },
        danger: { DEFAULT: '#B23230', bg: '#FBEAE9' },
        warning: { DEFAULT: '#B8860B', bg: '#FBF0DD', text: '#8A5A0B' },
        neutralChip: { bg: '#F1F0EC', text: '#6B6A64' },
        pm: { DEFAULT: '#3F3791', bg: '#EFEDF8' },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        frame: '14px',
        control: '9px',
      },
      boxShadow: {
        frame: '0 1px 3px rgba(0,0,0,0.06)',
        pop: '0 8px 28px rgba(27,42,74,0.12)',
      },
      fontSize: {
        eyebrow: ['10.5px', { lineHeight: '1.2', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
} satisfies Config;

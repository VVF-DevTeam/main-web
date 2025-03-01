import type { Config } from 'tailwindcss'

export default {
  important: true,
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          alt: 'var(--background-alt)',
          black: 'var(--background-black)',
          brand: 'var(--brand-color)',
          'brand-light': 'var(--brand-color-light)',
          gray: 'var(--background-gray)',
        },
        textColor: {
          DEFAULT: 'var(--text-default)',
          brand: 'var(--brand-color)',
          'brand-light': 'var(--brand-color-light)',
          white: 'var(--text-white)',
          gray: 'var(--text-gray)',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

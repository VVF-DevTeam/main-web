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
      keyframes: {
        placeHolderFade: {
          '0%': {
            opacity: '0',
            fontsize: '0px',
            transform: 'translateY(-30px)',
          },
          '3%': {
            opacity: '0',
            fontsize: '0px',
            transform: 'translateY(-30px)',
          },
          '20%': {
            opacity: '1',
            fontsize: 'inherit',
            transform: 'translateY(0)',
          },
          '97%': {
            opacity: '1',
            fontsize: 'inherit',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            fontsize: '0px',
            transform: 'translateY(30px)',
          },
        },
        roll: {
          '0%': {
            opacity: '0',
            fontsize: '0px',
            marginleft: '-30px',
            margintop: '0px',
            transform: 'rotate(-25deg)',
          },
          '3%': {
            opacity: '1',
            transform: 'rotate(0deg)',
          },
          '5%': {
            fontsize: 'inherit',
            opacity: '1',
            marginleft: '0px',
            margintop: '0px',
          },

          '70%': {
            fontsize: 'inherit',
            opacity: '1',
            marginleft: '0px',
            margintop: '0px',
            transform: 'rotate(0deg)',
          },

          '77%': {
            fontsize: '0px',
            opacity: '0',
            marginleft: '-50px',
            margintop: '-50px',
          },
          '100%': {
            fontsize: '0px',
            opacity: '0',
            marginleft: '-30px',
            margintop: '0px',
            transform: 'rotate(15deg)',
          },
        },
      },
      animation: {
        placeHolderFade: 'placeHolderFade 3s ease-in infinite',
        roll: 'roll 3s linear infinite 0.2s',
      },

      colors: {
        bgColor: {
          DEFAULT: 'hsl(var(--background-white))',
          black: 'hsl(var(--background-black))',
          blackLight: 'hsl(var(--background-black-light))',
          brand: 'hsl(var(--brand-color))',
          brandLight: 'hsl(var(--brand-color-light))',
          brandLighter: 'hsl(var(--brand-color-lighter))',
          brandDark: 'hsl(var(--brand-color-dark))',
          gray: 'hsl(var(--background-gray))',
          grayLight: 'hsl(var(--background-gray-light))',
          blue: 'hsl(var(--background-blue))',
          green: 'hsl(var(--background-green))',
          yellow: 'hsl(var(--background-yellow))',
          destructive: 'hsl(var(--destructive))',
        },
        textColor: {
          DEFAULT: 'hsl(var(--text-black))',
          brand: 'hsl(var(--brand-color))',
          brandLight: 'hsl(var(--brand-color-light))',
          brandDark: 'hsl(var(--brand-color-dark))',
          white: 'hsl(var(--text-white))',
          gray: 'hsl(var(--text-gray))',
          blue: 'hsl(var(--text-blue))',
          green: 'hsl(var(--text-green))',
          yellow: 'hsl(var(--text-yellow))',
          pink: 'hsl(var(--text-pink))',
          red: 'hsl(var(--text-red))',
          destructive: 'hsl(var(--destructive))',
        },
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')],
} satisfies Config

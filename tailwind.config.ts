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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        placeHolderFade: 'placeHolderFade 3s ease-in infinite',
        roll: 'roll 3s linear infinite 0.2s',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },

      colors: {
        bgColor: {
          DEFAULT: 'hsl(var(--white))',

          brand900: 'hsl(var(--brand-color-900))',
          brand600: 'hsl(var(--brand-color-600))',
          brand400: 'hsl(var(--brand-color-400))',
          brand200: 'hsl(var(--brand-color-200))',
          brand100: 'hsl(var(--brand-color-100))',

          brandDark900: 'hsl(var(--brand-color-dark900))',
          brandDark600: 'hsl(var(--brand-color-dark600))',
          brandDark400: 'hsl(var(--brand-color-dark400))',
          brandDark200: 'hsl(var(--brand-color-dark200))',
          brandDark100: 'hsl(var(--brand-color-dark100))',

          secondary900: 'hsl(var(--secondary-color-900))',
          secondary600: 'hsl(var(--secondary-color-600))',
          secondary400: 'hsl(var(--secondary-color-400))',
          secondary200: 'hsl(var(--secondary-color-200))',
          secondary100: 'hsl(var(--secondary-color-100))',
          secondary50: 'hsl(var(--secondary-color-50))',
          
          gray500: 'hsl(var(--gray-color-500))',
          gray300: 'hsl(var(--gray-color-300))',
          gray100: 'hsl(var(--gray-color-100))',

          black: 'hsl(var(--black))',
          white: 'hsl(var(--white))',
          destructive: 'hsl(var(--destructive))',
          blue: 'hsl(var(--blue))'
        },
        textColor: {
          DEFAULT: 'hsl(var(--black))',
          brand900: 'hsl(var(--brand-color-900))',
          brand600: 'hsl(var(--brand-color-600))',
          brand400: 'hsl(var(--brand-color-400))',
          brand200: 'hsl(var(--brand-color-200))',
          brand100: 'hsl(var(--brand-color-100))',

          brandDark900: 'hsl(var(--brand-color-dark900))',
          brandDark600: 'hsl(var(--brand-color-dark600))',
          brandDark400: 'hsl(var(--brand-color-dark400))',
          brandDark200: 'hsl(var(--brand-color-dark200))',
          brandDark100: 'hsl(var(--brand-color-dark100))',

          secondary900: 'hsl(var(--secondary-color-900))',
          secondary600: 'hsl(var(--secondary-color-600))',
          secondary400: 'hsl(var(--secondary-color-400))',
          secondary200: 'hsl(var(--secondary-color-200))',
          secondary100: 'hsl(var(--secondary-color-100))',
          secondary50: 'hsl(var(--secondary-color-50))',

          gray500: 'hsl(var(--gray-color-500))',
          gray300: 'hsl(var(--gray-color-300))',
          gray100: 'hsl(var(--gray-color-100))',

          black: 'hsl(var(--black))',
          white: 'hsl(var(--white))',
          destructive: 'hsl(var(--destructive))',
          blue: 'hsl(var(--blue))',
          red: 'hsl(var(--red))'
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

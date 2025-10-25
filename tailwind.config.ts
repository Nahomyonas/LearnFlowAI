import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        red: {
          100: 'oklch(.936 .032 17.717)',
          600: 'oklch(.577 .245 27.325)',
          700: 'oklch(.505 .213 27.518)',
        },
        orange: {
          500: 'oklch(.705 .213 47.604)',
          600: 'oklch(.646 .222 41.116)',
        },
        yellow: {
          100: 'oklch(.973 .071 103.193)',
          700: 'oklch(.554 .135 66.442)',
        },
        green: {
          100: 'oklch(.962 .044 156.743)',
          500: 'oklch(.723 .219 149.579)',
          600: 'oklch(.627 .194 149.214)',
          700: 'oklch(.527 .154 150.069)',
        },
        blue: {
          500: 'oklch(.623 .214 259.815)',
          600: 'oklch(.546 .245 262.881)',
          700: 'oklch(.488 .243 264.376)',
        },
        purple: {
          500: 'oklch(.627 .265 303.9)',
          600: 'oklch(.558 .288 302.321)',
          700: 'oklch(.496 .265 301.924)',
        },
        pink: {
          500: 'oklch(.656 .241 354.308)',
          600: 'oklch(.592 .249 .584)',
        },
        gray: {
          50: 'oklch(.985 .002 247.839)',
          100: 'oklch(.967 .003 264.542)',
          200: 'oklch(.928 .006 264.531)',
          500: 'oklch(.551 .027 264.364)',
          600: 'oklch(.446 .03 256.802)',
          700: 'oklch(.373 .034 259.733)',
          900: 'oklch(.21 .034 264.665)',
        },
        white: '#fff',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
      },
      container: {
        '7xl': '80rem',
      },
      spacing: {
        DEFAULT: '.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
      },
      letterSpacing: {
        widest: '.1em',
      },
      transitionDuration: {
        DEFAULT: '.15s',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(.4, 0, .2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

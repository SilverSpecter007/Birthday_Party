/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf6f0',
          100: '#faeadb',
          200: '#f4d2b5',
          300: '#ecb486',
          400: '#e2904f',
          500: '#da752e',
          600: '#cc5d23',
          700: '#a9471f',
          800: '#873a21',
          900: '#6d311d',
          950: '#3b170d',
        },
        warm: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6ddd0',
          300: '#d5c5b0',
          400: '#c1a88d',
          500: '#b39374',
          600: '#a68068',
          700: '#8a6957',
          800: '#71574a',
          900: '#5d4940',
          950: '#312521',
        },
        salon: {
          cream: '#faf8f5',
          gold: '#c8a87d',
          dark: '#2d2926',
          rose: '#c9928a',
          sage: '#8a9a7b',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

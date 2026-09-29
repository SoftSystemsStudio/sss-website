/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Loaded with next/font in app/layout.tsx
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        paper: '#F7F7F3', // page background
        limestone: '#E8E9E2', // bands, showcase stage, placeholders
        ink: {
          DEFAULT: '#17312B', // river green: headings, buttons, dark sections
          soft: '#3F4B46', // body copy
          muted: '#5C6762', // labels, captions
        },
        line: {
          DEFAULT: '#C3C8BD', // rules on limestone
          soft: '#DDE0D6', // rules on paper
        },
        sun: '#F2C230', // the one accent: highlight, CTA on dark sections
        'on-ink': '#C4CFCA', // secondary text on ink backgrounds
      },
      maxWidth: {
        page: '90rem', // 1440px: a 1280px column inside the lg gutters
      },
    },
  },
  plugins: [],
};

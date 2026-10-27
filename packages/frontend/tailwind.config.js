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
        brass: {
          DEFAULT: '#A8834B', // the one accent: rules, details, large type only (3.25:1 on paper)
          light: '#C9A66B', // brass on ink: CTA, focus, small text (6.1:1)
        },
        'on-ink': '#C4CFCA', // secondary text on ink backgrounds
      },
      maxWidth: {
        page: '112rem', // 1792px: a 1600px column inside the 2xl gutters, so wide screens aren't mostly margin
      },
    },
  },
  plugins: [],
};

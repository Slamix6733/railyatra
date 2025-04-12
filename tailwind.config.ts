import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Enable dark mode with class strategy instead of media queries
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--background)',
        secondary: 'var(--foreground)',
      },
      textColor: {
        primary: 'var(--foreground)',
        secondary: 'var(--background)',
      },
    },
  },
  plugins: [],
}

export default config 
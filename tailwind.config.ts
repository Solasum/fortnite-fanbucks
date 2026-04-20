import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fn-gold': '#E8B519',
        'fn-blue': '#009AC7',
        'fn-dark': '#0d1117',
      },
      fontFamily: {
        sans: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

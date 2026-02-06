/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebefff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4553bc',
        },
        secondary: {
          500: '#764ba2',
        }
      },
    },
  },
  plugins: [],
}

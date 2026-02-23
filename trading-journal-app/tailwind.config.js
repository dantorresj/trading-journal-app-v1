import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'carbon': '#3A3F46',
        'silver': '#E5E7EB',
        'gold-kint': '#D4AF37',
        'gold-dark': '#B8941F',
        'gold-50': '#FDF8E8',
        'gold-100': '#FAF0D1',
        'text-gray': '#6B7280',
        'growth-jade': '#10B981',
        'growth-dark': '#059669',
        'growth-light': '#D1FAE5',
        'growth-50': '#ECFDF5',
        'growth-200': '#A7F3D0',
        'lesson-red': '#EF4444',
        'lesson-light': '#FEE2E2',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.39)',
        'gold-lg': '0 10px 25px 0 rgba(212, 175, 55, 0.5)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
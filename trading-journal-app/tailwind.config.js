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
        // Paleta KintEdge - Filosofía Kintsugi
        'gold-kint': '#D4AF37',      // Oro principal (Kint + Toro)
        'gold-dark': '#B8941F',       // Oro oscuro (hover)
        'carbon': '#3A3F46',          // Carbón Edge (textos principales)
        'silver': '#E8E8E8',          // Plata reflexión (fondos secundarios)
        'lesson-red': '#DC2626',      // Rojo sutil para pérdidas
        'growth-jade': '#10B981',     // Verde jade para crecimiento
        'text-gray': '#6B7280',       // Gris para textos secundarios
        
        // Compatibilidad con código existente
        primary: {
          50: '#FAF8F3',
          100: '#F5F1E8',
          500: '#D4AF37',  // Oro Kintsugi
          600: '#B8941F',  // Oro oscuro
          700: '#9A7A1A',
        },
        secondary: {
          500: '#3A3F46',  // Carbón Edge
        }
      },
      fontFamily: {
        'heading': ['"Playfair Display"', 'Georgia', 'serif'],
        'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

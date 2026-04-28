/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      colors: {
        'ritmica': {
          pink:     '#E91E8C',   // magenta principal
          'pink-dark': '#C0166E',
          'pink-light':'#F8A8D8',
          rose:     '#FFF0F8',   // fondo suave
          dark:     '#1A1A2E',   // texto oscuro
          gray:     '#6B7280',
        },
      },
    },
  },
  plugins: [],
}

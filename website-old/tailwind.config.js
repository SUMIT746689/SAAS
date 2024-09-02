/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%': { transform: 'translateX(calc(100vh + 100%))' },
          '100%': { transform: 'translateX(-150%);' }
        },
        'top-to-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%);' }
        },
      },
      animation: {
        wiggle: 'wiggle 18s linear infinite',
        'top-to-bottom': 'top-to-bottom 5s linear infinite',
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        questrade: {
          green: '#0A5F2C',
          'green-dark': '#084A22',
          'green-light': '#E8F5E9',
          'yellow-bg': '#FFF9E6',
          'yellow-border': '#F5E6B8',
          'purple-bg': '#F3E8F9',
          'purple-text': '#7B1FA2',
          'info-bg': '#F5F0FF',
          'info-border': '#E0D4F5',
          grey: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        },
      },
      fontFamily: {
        display: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        mobile: '428px',
      },
    },
  },
  plugins: [],
};

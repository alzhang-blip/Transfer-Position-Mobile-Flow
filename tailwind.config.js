/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        design: {
          canvas: '#F5F7F9',
          surface: '#FFFFFF',
          border: '#E1E5EA',
          muted: '#707E94',
          ink: '#2D2D2D',
          primary: '#7D9A7D',
          'primary-hover': '#6B8A6B',
          'primary-dark': '#5A735A',
          link: '#4F7D5C',
          soft: '#EEF4EE',
          close: '#E8EAEE',
          'close-hover': '#DADEE5',
        },
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
        display: ['"DM Sans"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        mobile: '428px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(32, 36, 43, 0.06)',
        lift: '0 4px 24px rgba(32, 36, 43, 0.08)',
      },
    },
  },
  plugins: [],
};

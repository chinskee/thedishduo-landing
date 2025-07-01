module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        '2xl': '2rem',      // 32px for large headings
      },
      colors: {
        primary: '#6C5CE7', // your main brand blue
        accent: '#00B894',  // secondary accent green
        neutralLight: '#F7F9FB',
        neutralDark: '#2D3436',
      },
      borderRadius: {
        xl: '16px',         // larger card rounding
      },
      boxShadow: {
        card: '0 12px 24px rgba(0,0,0,0.08)', // soft, layered shadow
      },
    },
  },
  plugins: [],
};
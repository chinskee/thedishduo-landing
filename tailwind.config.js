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
        primary: '#5C4DFF',        // matches app primary
        accent: '#4AC7FA',         // matches app accent
        background: '#F6F7FB',     // app background
        surface: '#FFFFFF',        // app surface
        textMain: '#232347',       // app main text
        textSecondary: '#5B5B7A',  // app secondary text
        chipSelected: '#E3D9FF',   // app selected chip
        chipBg: '#F1F1F6',         // app chip background
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
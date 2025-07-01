const isDev = process.env.NODE_ENV === 'development';
const isVercel = !!process.env.VERCEL;

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: isDev || isVercel, // Disable on Vercel & in dev
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});
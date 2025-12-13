/** @type {import('next').NextConfig} */
// Next.js configuration file - defines how the app should behave
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  // Environment variables accessible in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig

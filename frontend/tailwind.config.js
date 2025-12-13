/** @type {import('tailwindcss').Config} */
// Tailwind CSS configuration - defines styling system
module.exports = {
  // Files where Tailwind should look for class names
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom colors for the app
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
        danger: '#EF4444', // Red
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light mode tokens
        primary: '#FF6F61',
        accent: '#84A98C',
        background: '#FFF5F5',
        apptext: '#2D1F1F',
        surface: '#EAD4D4',
        border: '#EAD4D4',
        // Dark mode tokens
        primary_dark: '#FF8A80',
        accent_dark: '#A5D6A7',
        background_dark: '#2D1F1F',
        apptext_dark: '#FFF5F5',
        surface_dark: '#3E2C2C',
        border_dark: '#3E2C2C',
      },
    },
  },
  plugins: [],
};

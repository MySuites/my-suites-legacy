/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/mycpo/app/**/*.{js,jsx,ts,tsx}",
    "./apps/mycpo/components/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/**/*.{js,jsx,ts,tsx}",
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
        // Dark mode tokens (use with `dark:` prefix)
        'primary-dark': '#FF8A80',
        'accent-dark': '#A5D6A7',
        'background-dark': '#2D1F1F',
        'apptext-dark': '#FFF5F5',
        'surface-dark': '#3E2C2C',
        'border-dark': '#3E2C2C',
      },
    },
  },
  plugins: [],
};
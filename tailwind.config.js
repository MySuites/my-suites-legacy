/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/mycpo/app/**/*.{js,jsx,ts,tsx}",
    "./apps/mycpo/components/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
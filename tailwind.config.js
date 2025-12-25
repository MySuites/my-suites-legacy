const { baseColors, appThemes } = require('./packages/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/myhealth/app/**/*.{js,jsx,ts,tsx}",
    "./apps/myhealth/components/**/*.{js,jsx,ts,tsx}",
    "./apps/myfinancials/app/**/*.{js,jsx,ts,tsx}",
    "./apps/myfinancials/components/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      backgroundColor: {
        'light-lighter': baseColors.light.bgLight,
        'light': baseColors.light.bg,
        'light-darker': baseColors.light.bgDark,
        
        'dark-lighter': baseColors.dark.bgLight,
        'dark': baseColors.dark.bg,
        'dark-darker': baseColors.dark.bgDark,

        primary: appThemes.myhealth.light.primary,
        'primary-dark': appThemes.myhealth.dark.primary,
        accent: appThemes.myhealth.light.accent,
        'accent-dark': appThemes.myhealth.dark.accent,
      },
      textColor: {
        'light': baseColors.light.text,
        'light-muted': baseColors.light.textMuted,
        'dark': baseColors.dark.text,
        'dark-muted': baseColors.dark.textMuted,

        primary: appThemes.myhealth.light.primary,
        'primary-dark': appThemes.myhealth.dark.primary,
        accent: appThemes.myhealth.light.accent,
        'accent-dark': appThemes.myhealth.dark.accent,
      },
      borderColor: {
        'light': baseColors.light.border,
        'dark': baseColors.dark.border,

        primary: appThemes.myhealth.light.primary,
        'primary-dark': appThemes.myhealth.dark.primary,
        accent: appThemes.myhealth.light.accent,
        'accent-dark': appThemes.myhealth.dark.accent,
      },
      colors: {
        error: baseColors.light.error,
      },
    },
  },
  plugins: [],
};
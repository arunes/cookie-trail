/** @type {import('tailwindcss').Config} */
// Single source of truth for application colors (Tailwind transforms this
// require through jiti, which loads the TypeScript tokens file).
const { colors } = require('./src/theme/tokens');

module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors },
  },
  plugins: [],
};

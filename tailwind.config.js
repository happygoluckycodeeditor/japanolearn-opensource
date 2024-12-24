/* eslint-disable prettier/prettier */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { default: daisyui } = require('daisyui');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["cupcake", "dark", "cmyk"],
  }
}


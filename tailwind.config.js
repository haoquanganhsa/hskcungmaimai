/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
        rose: { 50:'#fff1f2',100:'#ffe4e6',400:'#fb7185',500:'#f43f5e',600:'#e11d48' }
      },
      fontFamily: { sans: ['Inter','Noto Sans SC','sans-serif'] }
    }
  },
  plugins: []
}

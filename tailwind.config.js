/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0B0A12',
        card: '#171522',
        pumpkin: '#FF7518',
        witch: '#9146FF',
        bone: '#F4EFE6',
        slime: '#5EEAA0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: { glow: '0 0 24px rgba(255,117,24,.35)' },
      keyframes: {
        fly: {
          '0%': { transform: 'translate(-5vw,0)' },
          '50%': { transform: 'translate(55vw,36px)' },
          '100%': { transform: 'translate(110vw,-24px)' },
        },
        flicker: {
          '0%,100%': { opacity: 1 },
          '45%': { opacity: 0.7 },
          '50%': { opacity: 1 },
          '55%': { opacity: 0.8 },
        },
        pulseglow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,117,24,.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,117,24,0)' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        sway: {
          '0%,100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        wobble: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        fly: 'fly 24s linear infinite',
        flicker: 'flicker 3s ease-in-out infinite',
        pulseglow: 'pulseglow 2s ease-out infinite',
        bob: 'bob 4s ease-in-out infinite',
        sway: 'sway 5s ease-in-out infinite',
        wobble: 'wobble 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

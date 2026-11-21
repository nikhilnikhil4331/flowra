/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F25B8A',
          dark: '#EE4D7B',
          light: '#F78FB0',
          soft: '#FDE9F0',
          pale: '#FFF3F6',
        },
        ink: {
          DEFAULT: '#3D2C33',
          soft: '#7A5C66',
          mute: '#B08F9A',
          faint: '#D5B9C1',
        },
        blush: {
          bg: '#FFF8F5',
          card: '#FFFFFF',
          line: '#F7E3E6',
        },
        lavender: '#B9A7F2',
        minty: '#4ECDC4',
        sky2: '#6FA8E8',
        sunny: '#FFB657',
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        card: '0 6px 24px rgba(242, 91, 138, 0.08), 0 2px 6px rgba(61, 44, 51, 0.04)',
        soft: '0 4px 16px rgba(242, 91, 138, 0.10)',
        btn: '0 8px 20px rgba(238, 77, 123, 0.35)',
        fab: '0 10px 24px rgba(238, 77, 123, 0.45)',
        phone: '0 40px 90px rgba(122, 62, 94, 0.35), 0 12px 28px rgba(122, 62, 94, 0.22)',
      },
      backgroundImage: {
        'grad-pink': 'linear-gradient(135deg, #F77FA5 0%, #F25B8A 45%, #EE4D7B 100%)',
        'grad-screen': 'linear-gradient(180deg, #FFFBF8 0%, #FFF5F3 45%, #FFEEF2 100%)',
        'grad-desktop': 'linear-gradient(135deg, #F6E7F4 0%, #FDEBEE 45%, #FFF3E4 100%)',
      },
      animation: {
        'fade-up': 'fadeUp .45s cubic-bezier(.22,.9,.35,1) both',
        'fade-in': 'fadeIn .35s ease both',
        floaty: 'floaty 5s ease-in-out infinite',
        pop: 'pop .3s cubic-bezier(.34,1.56,.64,1) both',
        'sheet-up': 'sheetUp .35s cubic-bezier(.22,.9,.35,1) both',
        'petal-fall': 'petalFall linear infinite',
        'typing-dot': 'typingDot 1.2s ease-in-out infinite',
        'scan-line': 'scanLine 1.6s ease-in-out infinite',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pop: { from: { transform: 'scale(.85)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        sheetUp: { from: { transform: 'translateY(40px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        petalFall: {
          '0%': { transform: 'translate3d(0,-10%,0) rotate(0deg)', opacity: '0' },
          '8%': { opacity: '.85' },
          '50%': { transform: 'translate3d(14px,55vh,0) rotate(160deg)' },
          '100%': { transform: 'translate3d(-10px,110vh,0) rotate(320deg)', opacity: '0' },
        },
        typingDot: { '0%,60%,100%': { transform: 'translateY(0)', opacity: '.4' }, '30%': { transform: 'translateY(-4px)', opacity: '1' } },
        scanLine: { '0%,100%': { top: '8%' }, '50%': { top: '88%' } },
        wiggle: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
      },
    },
  },
  plugins: [],
};

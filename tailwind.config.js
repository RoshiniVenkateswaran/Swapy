/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A8FFF',
        accent: '#8B5CF6',
        dark: '#1a1d29',
        light: '#F5F7FA',
        success: '#2ECC71',
        warning: '#F5A623',
        danger: '#EF4444',
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(255, 255, 255, 0.5)',
          border: 'rgba(255, 255, 255, 0.8)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-light': 'linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)',
        'gradient-primary': 'linear-gradient(135deg, #4A8FFF 0%, #8B5CF6 100%)',
        'gradient-glow': 'linear-gradient(135deg, rgba(74, 143, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


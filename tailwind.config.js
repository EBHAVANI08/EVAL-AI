/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        positive: 'var(--positive)',
        'positive-bg': 'var(--positive-bg)',
        negative: 'var(--negative)',
        'negative-bg': 'var(--negative-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.05)',
        'card-hover': '0 4px 24px rgba(79,70,229,0.10)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        dropdown: '0 8px 24px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
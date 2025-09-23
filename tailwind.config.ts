import type { Config } from 'tailwindcss';

const config: Config = {
  // 📁 Content paths for Tailwind scanning
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // 🌙 Dark mode configuration
  darkMode: 'class', // Enable class-based dark mode

  theme: {
    extend: {
      // 🎨 Custom color palette
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#ff9999',
          400: '#ff6666',
          500: '#ff0033', // brand primary
          600: '#e6002e',
          700: '#cc0029',
          800: '#b30024',
          900: '#99001f',
          950: '#4d0010',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },

      // 📏 Custom spacing scale
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },

      // 🎭 Enhanced animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // 🎬 Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // 🌑 Enhanced shadows
      boxShadow: {
        'glow': '0 0 20px rgba(255, 0, 51, 0.3)',
        'glow-lg': '0 0 30px rgba(255, 0, 51, 0.4)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      // 📐 Enhanced border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },

      // 🎯 Typography enhancements
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // 📱 Extended screens for better responsive design
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },

      // 🎨 Background patterns
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': `
          linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
      },

      // 🔧 Enhanced transitions
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },

      // 📏 Container queries support
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },

  // 🔌 Plugin configuration
  plugins: [
    // Add container queries support
    function({ addUtilities, addComponents }: any) {
      addUtilities({
        '.container-queries': {
          'container-type': 'inline-size',
        },
        '.container-normal': {
          'container-type': 'normal',
        },
        '.container-size': {
          'container-type': 'size',
        },
      });

      addComponents({
        // 🎨 Modern button component styles
        '.btn': {
          '@apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-150': {},
          '@apply focus:outline-none focus:ring-2 focus:ring-offset-2': {},
          '@apply disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn bg-primary text-white hover:bg-primary-700 focus:ring-primary/20': {},
        },
        '.btn-secondary': {
          '@apply btn bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400/20': {},
          '@apply dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700': {},
        },
        
        // 📋 Modern card component styles
        '.card': {
          '@apply rounded-lg border border-gray-200 bg-white p-6 shadow-card': {},
          '@apply dark:border-gray-700 dark:bg-gray-800': {},
        },
        '.card-interactive': {
          '@apply card transition-all duration-150 hover:shadow-card-hover hover:scale-[1.01] cursor-pointer': {},
        },

        // 📝 Modern input styles
        '.input': {
          '@apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm': {},
          '@apply placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary': {},
          '@apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100': {},
        },
      });
    },

    // Add scroll behavior utilities
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgba(156, 163, 175, 0.5)',
            'border-radius': '4px',
          },
        },
      });
    },
  ],

  // ⚡ Performance optimizations
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles when supported
  },

  // 🎯 Additional configuration
  experimental: {
    optimizeUniversalDefaults: true,
  },
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调 - kissopen Coral 珊瑚红 (brand base #F2685C)
        primary: {
          50: '#FFF3F1',
          100: '#FFE3DE',
          200: '#FCC6BE',
          300: '#F7A096',
          400: '#F2685C',
          500: '#E55344',
          600: '#CB3D2F',
          700: '#A52F23',
          800: '#7E251C',
          900: '#561A14',
          950: '#3A110D'
        },
        // 次品牌色 - kissopen Pink 粉 (brand base #F49AB6)
        secondary: {
          50: '#FFF4F7',
          100: '#FEE6EC',
          200: '#FBCDD9',
          300: '#F7AEC2',
          400: '#F49AB6',
          500: '#ED7A9C',
          600: '#DD557E',
          700: '#B83E62',
          800: '#8C2E4A',
          900: '#5E2032',
          950: '#3E1421'
        },
        pink: {
          50: '#FFF4F7',
          100: '#FEE6EC',
          200: '#FBCDD9',
          300: '#F7AEC2',
          400: '#F49AB6',
          500: '#ED7A9C',
          600: '#DD557E',
          700: '#B83E62',
          800: '#8C2E4A',
          900: '#5E2032',
          950: '#3E1421'
        },
        // 暖中性灰 - kissopen warm neutrals (warm red-brown tint)
        gray: {
          50: '#FBF6F4',
          100: '#F4EDEA',
          200: '#E9DFDB',
          300: '#D8CBC6',
          400: '#B3A7A2',
          500: '#8A7E79',
          600: '#655B57',
          700: '#463E3B',
          800: '#2C2624',
          900: '#1B1614',
          950: '#120E0D'
        },
        // 辅助色 - 暖中性 (warm neutrals)
        accent: {
          50: '#FBF6F4',
          100: '#F4EDEA',
          200: '#E9DFDB',
          300: '#D8CBC6',
          400: '#B3A7A2',
          500: '#8A7E79',
          600: '#655B57',
          700: '#463E3B',
          800: '#2C2624',
          900: '#1B1614',
          950: '#120E0D'
        },
        // 深色模式背景 - 暖近黑 (warm near-black)
        dark: {
          50: '#FBF6F4',
          100: '#F4EDEA',
          200: '#E9DFDB',
          300: '#D8CBC6',
          400: '#B3A7A2',
          500: '#8A7E79',
          600: '#655B57',
          700: '#463E3B',
          800: '#2C2624',
          900: '#1B1614',
          950: '#120E0D'
        }
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        // 暖色调阴影 - warm-tinted (shadow color rgba(86,26,20,…), not gray)
        glass: '0 8px 32px rgba(86, 26, 20, 0.08)',
        'glass-sm': '0 4px 16px rgba(86, 26, 20, 0.06)',
        glow: '0 8px 24px rgba(242, 104, 92, 0.32)',
        'glow-lg': '0 12px 36px rgba(242, 104, 92, 0.40)',
        card: '0 1px 3px rgba(86, 26, 20, 0.07), 0 1px 2px rgba(86, 26, 20, 0.05)',
        'card-hover': '0 12px 28px rgba(86, 26, 20, 0.10), 0 4px 10px rgba(86, 26, 20, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // 招牌渐变 - coral kissing pink at 105°
        'gradient-primary': 'linear-gradient(105deg, #F2685C 0%, #EF8E88 48%, #F49AB6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2C2624 0%, #1B1614 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(242, 104, 92, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(244, 154, 182, 0.10) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(239, 142, 136, 0.08) 0px, transparent 50%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(242, 104, 92, 0.25)' },
          '100%': { boxShadow: '0 0 30px rgba(242, 104, 92, 0.4)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}

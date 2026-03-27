import { createSystem, defaultConfig } from '@chakra-ui/react'

const customConfig = {
  ...defaultConfig,
  theme: {
    ...defaultConfig.theme,
    tokens: {
      ...(defaultConfig.theme?.tokens || {}),
      colors: {
        ...(defaultConfig.theme?.tokens?.colors || {}),
        brand: {
          50: { value: '#f0f9ff' },
          100: { value: '#e0f2fe' },
          200: { value: '#bae6fd' },
          300: { value: '#7dd3fc' },
          400: { value: '#38bdf8' },
          500: { value: '#0ea5e9' },
          600: { value: '#0284c7' },
          700: { value: '#0369a1' },
          800: { value: '#075985' },
          900: { value: '#0c4a6e' },
        },
        canvas: {
          bg: { value: '#ffffff' },
          border: { value: '#dee2e6' },
        },
        annotation: {
          crux: {
            bg: { value: '#ffe6e6' },
            color: { value: '#cc0000' },
            fill: { value: '#ff4444' },
            stroke: { value: '#cc0000' },
          },
          rest: {
            bg: { value: '#e6ffe6' },
            color: { value: '#00cc00' },
            fill: { value: '#44ff44' },
            stroke: { value: '#00cc00' },
          },
        },
      },
      shadows: {
        ...(defaultConfig.theme?.tokens?.shadows || {}),
        canvas: { value: '0 2px 8px rgba(0, 0, 0, 0.1)' },
        control: { value: '0 2px 4px rgba(0, 0, 0, 0.1)' },
        controlHover: { value: '0 4px 8px rgba(0, 0, 0, 0.15)' },
      },
    },
    breakpoints: {
      base: '0px',
      sm: '480px',
      md: '768px',
      tablet: '850px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
}

export default createSystem(customConfig)

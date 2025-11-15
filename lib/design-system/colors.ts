/**
 * HRSD Design System - Colors
 * Based on https://www.hrsd.gov.sa/
 * Saudi Government Official Colors
 */

export const hrsdColors = {
  // Primary - Saudi Green (Official Government Color)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',   // Main Saudi Green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    DEFAULT: '#22c55e',
  },
  
  // Secondary - Saudi Gold/Brown (Government Accent)
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    DEFAULT: '#eab308',
  },
  
  // Neutral - Gray Scale
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic Colors (Government Standard)
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
  
  // Background Colors
  background: {
    light: '#ffffff',
    soft: '#fafafa',
    muted: '#f5f5f5',
    dark: '#1a1a1a',
  },
  
  // Text Colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    muted: '#737373',
    light: '#a3a3a3',
    inverse: '#ffffff',
  },
  
  // Border Colors
  border: {
    light: '#f5f5f5',
    DEFAULT: '#e5e5e5',
    dark: '#d4d4d4',
  },
}

export type HRSDColor = keyof typeof hrsdColors


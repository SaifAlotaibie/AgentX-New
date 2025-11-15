/**
 * HRSD Design System - Typography
 * Based on https://www.hrsd.gov.sa/
 * Saudi Government Typography System
 */

export const hrsdTypography = {
  // Font Families (Arabic First - RTL)
  fontFamily: {
    primary: ['Noto Kufi Arabic', 'Tajawal', 'sans-serif'],
    secondary: ['Cairo', 'Almarai', 'sans-serif'],
    english: ['Inter', 'Roboto', '-apple-system', 'sans-serif'],
    mono: ['Courier New', 'monospace'],
  },
  
  // Font Sizes (Government Standard Scale)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.25rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.5rem' }],      // 14px
    base: ['1rem', { lineHeight: '1.75rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.875rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '2rem' }],         // 20px
    '2xl': ['1.5rem', { lineHeight: '2.25rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.5rem' }],   // 30px
    '4xl': ['2.25rem', { lineHeight: '2.75rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '3.5rem' }],       // 48px
    '6xl': ['3.75rem', { lineHeight: '4rem' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '4.75rem' }],    // 72px
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Letter Spacing (Arabic Optimized)
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
}

export type HRSDTypography = typeof hrsdTypography


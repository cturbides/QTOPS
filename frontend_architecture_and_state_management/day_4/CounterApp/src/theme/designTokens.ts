export const designTokens = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#1C1C1E',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    surface: '#F2F2F7',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    fontSize: {
      xs: 12,
      small: 14,
      medium: 16,
      large: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

/**
 * Dark theme tokens
 */
export const darkTokens = {
  ...designTokens,
  colors: {
    ...designTokens.colors,
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
  },
};

export type DesignTokens = typeof designTokens;
export type ColorTokens = keyof typeof designTokens.colors;
export type SpacingTokens = keyof typeof designTokens.spacing;
export type FontSizeTokens = keyof typeof designTokens.typography.fontSize;

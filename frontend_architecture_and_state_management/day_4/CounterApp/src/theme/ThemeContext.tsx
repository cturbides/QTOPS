import React, { createContext, useContext, useState, ReactNode } from 'react';
import { designTokens, darkTokens, DesignTokens } from './designTokens';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  tokens: DesignTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const tokens = theme === 'dark' ? darkTokens : designTokens;

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    tokens,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

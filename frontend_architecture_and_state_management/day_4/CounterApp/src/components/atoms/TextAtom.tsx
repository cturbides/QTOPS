import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import { TextAtomProps } from './TextAtom.interface';

const TextAtom: React.FC<TextAtomProps> = ({
  children,
  variant = 'body',
  color = 'text',
  align = 'left',
  weight = 'regular',
  style,
}) => {
  const { tokens } = useTheme();

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: tokens.typography.fontSize.xxl,
          fontWeight: tokens.typography.fontWeight.bold,
          lineHeight: tokens.typography.fontSize.xxl * tokens.typography.lineHeight.tight,
        };
      case 'h2':
        return {
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.bold,
          lineHeight: tokens.typography.fontSize.xl * tokens.typography.lineHeight.tight,
        };
      case 'h3':
        return {
          fontSize: tokens.typography.fontSize.large,
          fontWeight: tokens.typography.fontWeight.semibold,
          lineHeight: tokens.typography.fontSize.large * tokens.typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontSize: tokens.typography.fontSize.xs,
          lineHeight: tokens.typography.fontSize.xs * tokens.typography.lineHeight.normal,
        };
      case 'label':
        return {
          fontSize: tokens.typography.fontSize.small,
          fontWeight: tokens.typography.fontWeight.medium,
          lineHeight: tokens.typography.fontSize.small * tokens.typography.lineHeight.normal,
        };
      default: // body
        return {
          fontSize: tokens.typography.fontSize.medium,
          lineHeight: tokens.typography.fontSize.medium * tokens.typography.lineHeight.normal,
        };
    }
  };

  const getColorStyle = (): string => {
    switch (color) {
      case 'textSecondary':
        return tokens.colors.textSecondary;
      case 'primary':
        return tokens.colors.primary;
      case 'error':
        return tokens.colors.error;
      case 'success':
        return tokens.colors.success;
      default:
        return tokens.colors.text;
    }
  };

  return (
    <Text
      style={[
        getVariantStyles(),
        {
          color: getColorStyle(),
          textAlign: align,
          fontWeight: tokens.typography.fontWeight[weight],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default TextAtom;

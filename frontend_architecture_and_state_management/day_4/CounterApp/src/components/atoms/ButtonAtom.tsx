import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import { ButtonAtomProps } from './ButtonAtom.interface';

const ButtonAtom: React.FC<ButtonAtomProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
}) => {
  const { tokens } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: tokens.colors.primary },
          text: { color: '#FFFFFF' },
        };
      case 'secondary':
        return {
          container: { backgroundColor: tokens.colors.secondary },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: tokens.colors.primary,
          },
          text: { color: tokens.colors.primary },
        };
      case 'danger':
        return {
          container: { backgroundColor: tokens.colors.error },
          text: { color: '#FFFFFF' },
        };
      default:
        return {
          container: { backgroundColor: tokens.colors.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingHorizontal: tokens.spacing.medium,
            paddingVertical: tokens.spacing.small,
          },
          text: {
            fontSize: tokens.typography.fontSize.small,
          },
        };
      case 'large':
        return {
          container: {
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.large,
          },
          text: {
            fontSize: tokens.typography.fontSize.large,
          },
        };
      default:
        return {
          container: {
            paddingHorizontal: tokens.spacing.large,
            paddingVertical: tokens.spacing.medium,
          },
          text: {
            fontSize: tokens.typography.fontSize.medium,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderRadius: tokens.borderRadius.medium,
          ...tokens.shadows.medium,
        },
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          {
            fontWeight: tokens.typography.fontWeight.semibold,
          },
          variantStyles.text,
          sizeStyles.text,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ButtonAtom;

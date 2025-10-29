import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import { CardMoleculeProps } from './CardMolecule.interface';

const CardMolecule: React.FC<CardMoleculeProps> = ({
  children,
  elevated = true,
  padding = 'medium',
  style,
}) => {
  const { tokens } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'small':
        return tokens.spacing.small;
      case 'large':
        return tokens.spacing.large;
      default:
        return tokens.spacing.medium;
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.borderRadius.large,
          padding: getPadding(),
          ...(elevated ? tokens.shadows.medium : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default CardMolecule;

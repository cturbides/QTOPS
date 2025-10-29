import { ViewStyle } from 'react-native';

export interface CardMoleculeProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

import { TextStyle } from 'react-native';

export interface TextAtomProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: 'text' | 'textSecondary' | 'primary' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: TextStyle;
}

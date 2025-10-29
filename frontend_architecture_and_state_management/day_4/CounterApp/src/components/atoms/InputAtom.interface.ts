import { TextInputProps as RNTextInputProps } from 'react-native';

export interface InputAtomProps extends Omit<RNTextInputProps, 'style'> {
  error?: boolean;
  errorMessage?: string;
}

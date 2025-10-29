export interface TaskFormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad';
  hint?: string;
}

export interface FormFieldMoleculeProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
}

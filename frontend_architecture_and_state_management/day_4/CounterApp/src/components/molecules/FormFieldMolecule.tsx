import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import TextAtom from 'src/components/atoms/TextAtom';
import InputAtom from 'src/components/atoms/InputAtom';
import { FormFieldMoleculeProps } from './FormFieldMolecule.interface';

const FormFieldMolecule: React.FC<FormFieldMoleculeProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = false,
  errorMessage,
  required = false,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={{ marginBottom: tokens.spacing.medium }}>
      <TextAtom variant="label" style={{ marginBottom: tokens.spacing.small }}>
        {label}
        {required && (
          <TextAtom variant="label" color="error">
            {' '}
            *
          </TextAtom>
        )}
      </TextAtom>
      <InputAtom
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={error}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export default FormFieldMolecule;

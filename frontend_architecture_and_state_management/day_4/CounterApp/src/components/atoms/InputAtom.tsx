import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import { InputAtomProps } from './InputAtom.interface';
import TextAtom from './TextAtom';

const InputAtom: React.FC<InputAtomProps> = ({
  error = false,
  errorMessage,
  ...textInputProps
}) => {
  const { tokens } = useTheme();

  return (
    <View>
      <TextInput
        style={[
          {
            backgroundColor: tokens.colors.surface,
            borderColor: error ? tokens.colors.error : tokens.colors.border,
            borderWidth: 1,
            borderRadius: tokens.borderRadius.medium,
            paddingHorizontal: tokens.spacing.medium,
            paddingVertical: tokens.spacing.small,
            fontSize: tokens.typography.fontSize.medium,
            color: tokens.colors.text,
          },
          styles.input,
        ]}
        placeholderTextColor={tokens.colors.textSecondary}
        {...textInputProps}
      />
      {error && errorMessage && (
        <TextAtom variant="caption" color="error" style={styles.errorText}>
          {errorMessage}
        </TextAtom>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
  },
  errorText: {
    marginTop: 4,
  },
});

export default InputAtom;

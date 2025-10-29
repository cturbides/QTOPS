import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { TaskFormInputProps } from './TaskFormInput.interface';

const TaskFormInput: React.FC<TaskFormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  hint,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});

export default TaskFormInput;

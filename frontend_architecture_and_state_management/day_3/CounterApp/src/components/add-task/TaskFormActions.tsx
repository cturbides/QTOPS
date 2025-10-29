import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskFormActionsProps } from './TaskFormActions.interface';

const TaskFormActions: React.FC<TaskFormActionsProps> = ({
  onSubmit,
  onCancel,
  submitText = 'Crear Tarea',
  cancelText = 'Cancelar',
}) => {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
        <Text style={styles.primaryButtonText}>{submitText}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
        <Text style={styles.secondaryButtonText}>{cancelText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskFormActions;

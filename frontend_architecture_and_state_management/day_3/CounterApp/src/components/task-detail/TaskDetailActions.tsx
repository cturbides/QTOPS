import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskDetailActionsProps } from './TaskDetailActions.interface';

const TaskDetailActions: React.FC<TaskDetailActionsProps> = ({ task, onToggle, onDelete }) => {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.button, styles.toggleButton]} onPress={onToggle}>
        <Text style={styles.buttonText}>
          {task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
        <Text style={styles.buttonText}>Eliminar Tarea</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
  },
  button: {
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
  toggleButton: {
    backgroundColor: '#0066cc',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TaskDetailActions;

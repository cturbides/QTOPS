import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskDetailMetadataProps } from './TaskDetailMetadata.interface';

const TaskDetailMetadata: React.FC<TaskDetailMetadataProps> = ({ task }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Información de Fechas</Text>
      <View style={styles.dateInfo}>
        <Text style={styles.dateLabel}>Creada:</Text>
        <Text style={styles.dateValue}>{new Date(task.createdAt).toLocaleString('es-ES')}</Text>
      </View>
      <View style={styles.dateInfo}>
        <Text style={styles.dateLabel}>Actualizada:</Text>
        <Text style={styles.dateValue}>{new Date(task.updatedAt).toLocaleString('es-ES')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
});

export default TaskDetailMetadata;

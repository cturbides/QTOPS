import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskDetailInfoProps } from './TaskDetailInfo.interface';

const TaskDetailInfo: React.FC<TaskDetailInfoProps> = ({ task }) => {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Título</Text>
        <Text style={[styles.title, task.completed && styles.completedText]}>
          {task.title}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ID de Usuario</Text>
          <Text style={styles.infoValue}>#{task.userId}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ID de Tarea</Text>
          <Text style={styles.infoValue}>{task.id.substring(0, 8)}...</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusDetail}>
          <Text style={styles.statusDetailText}>
            Esta tarea se encuentra {task.completed ? 'completada' : 'pendiente de completar'}.
          </Text>
        </View>
      </View>
    </>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
  },
  statusDetail: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  statusDetailText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
});

export default TaskDetailInfo;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useGetTaskByIdQuery } from 'src/services/tasksApi';
import { TaskDetailProps } from 'src/types/task-details.type';


const TaskDetailScreen: React.FC<TaskDetailProps> = ({ route }) => {
  const { taskId } = route.params;
  const { data: task, isLoading, error } = useGetTaskByIdQuery(taskId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar la tarea</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.statusBadge, task.completed ? styles.completedBadge : styles.pendingBadge]}>
        <Text style={styles.statusText}>
          {task.completed ? '✓ Completada' : '○ Pendiente'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Título</Text>
        <Text style={[styles.title, task.completed && styles.completedText]}>
          {task.title}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ID de Tarea</Text>
          <Text style={styles.infoValue}>#{task.id}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ID de Usuario</Text>
          <Text style={styles.infoValue}>#{task.userId}</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
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
    fontSize: 24,
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

export default TaskDetailScreen;

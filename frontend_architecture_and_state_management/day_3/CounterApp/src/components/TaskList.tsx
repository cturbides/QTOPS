import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';

import TaskCard from './TaskCard';
import { TaskListProps } from './TaskListProps.interface';

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, error, onTaskPress }) => {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay tareas disponibles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskCard 
          task={item} 
          onPress={onTaskPress ? () => onTaskPress(item.id) : undefined}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskList;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTaskStore } from 'src/stores/useTaskStore';
import { TaskDetailRouteProp } from 'src/types/task-details.type';
import { RootStackParamList } from 'src/constants/common.constants';
import TaskDetailHeader from 'src/components/task-detail/TaskDetailHeader';
import TaskDetailInfo from 'src/components/task-detail/TaskDetailInfo';
import TaskDetailMetadata from 'src/components/task-detail/TaskDetailMetadata';
import TaskDetailActions from 'src/components/task-detail/TaskDetailActions';

type TaskDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC = () => {
  const route = useRoute<TaskDetailRouteProp>();
  const navigation = useNavigation<TaskDetailNavigationProp>();
  const { taskId } = route.params;
  
  // Suscribirse reactivamente a la tarea específica
  const task = useTaskStore((state) => 
    state.tasks.find((t) => t.id === taskId)
  );
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const removeTask = useTaskStore((state) => state.removeTask);

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Tarea no encontrada</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleToggle = () => {
    toggleTask(taskId);
  };

  const handleDelete = () => {
    removeTask(taskId);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TaskDetailHeader task={task} />
      <TaskDetailInfo task={task} />
      <TaskDetailMetadata task={task} />
      <TaskDetailActions task={task} onToggle={handleToggle} onDelete={handleDelete} />
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
  errorText: {
    fontSize: 16,
    color: '#cc0000',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;

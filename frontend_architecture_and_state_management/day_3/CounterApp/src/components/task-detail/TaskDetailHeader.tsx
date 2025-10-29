import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskDetailHeaderProps } from './TaskDetailHeader.interface';

const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({ task }) => {
  return (
    <View style={[styles.statusBadge, task.completed ? styles.completedBadge : styles.pendingBadge]}>
      <Text style={styles.statusText}>
        {task.completed ? '✓ Completada' : '○ Pendiente'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default TaskDetailHeader;

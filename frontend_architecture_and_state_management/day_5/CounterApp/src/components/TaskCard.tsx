import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskCardProps } from './TaskCardProps.interface';

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const content = (
    <View style={[styles.card, task.completed && styles.completedCard]}>
      <View style={styles.header}>
        <Text style={styles.userId}>Usuario #{task.userId}</Text>
        <View style={[styles.badge, task.completed ? styles.completedBadge : styles.pendingBadge]}>
          <Text style={styles.badgeText}>
            {task.completed ? '✓ Completada' : '○ Pendiente'}
          </Text>
        </View>
      </View>
      <Text style={[styles.title, task.completed && styles.completedTitle]}>
        {task.title}
      </Text>
      <Text style={styles.taskId}>ID: {task.id}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskId: {
    fontSize: 12,
    color: '#999',
  },
});

export default TaskCard;

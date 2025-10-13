import React from 'react';
import { TaskProps } from './TaskProps.interface';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TaskItem = React.memo(({ task, onPress }: TaskProps) => {
    return (
        <TouchableOpacity style={styles.taskItem} onPress={() => onPress(task.id)}>
            <Text style={[styles.taskText, task.completed && styles.completedText]}>
                {task.completed ? '✅' : '⬜'} {task.title}
            </Text>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    taskItem: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    taskText: { fontSize: 16 },
    completedText: { textDecorationLine: 'line-through', color: '#666' },
});

export default TaskItem;

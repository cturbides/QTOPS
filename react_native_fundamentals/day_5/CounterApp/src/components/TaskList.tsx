import React, { useCallback } from 'react';

import TaskItem from './Task';
import TaskListEmpty from './TaskListEmpty';
import { Task } from 'src/types/task.entity';
import { useTasks } from 'src/hooks/use-tasks.hook';
import { FlatList, View, Text, StyleSheet } from 'react-native';

const TaskList: React.FC = () => {
    const { data, toggle, keyExtractor } = useTasks();

    const renderItem = useCallback(
        ({ item }: { item: Task }) => <TaskItem task={item} onPress={toggle} />,
        [toggle]
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Tareas</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={TaskListEmpty}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    list: { flex: 1 },
});

export default TaskList;

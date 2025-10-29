import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import TaskList from 'src/components/TaskList';
import { useGetTasksQuery } from 'src/services/tasksApi';
import { RootStackParamList } from 'src/constants/common.constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { data: tasks = [], isLoading, error } = useGetTasksQuery();

    const handleTaskPress = (taskId: number) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    return (
        <View style={styles.container}>
            <TaskList 
                tasks={tasks} 
                loading={isLoading} 
                error={error ? 'Error al cargar tareas' : null}
                onTaskPress={handleTaskPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default HomeScreen;
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import TaskList from 'src/components/TaskList';
import { useTaskStore } from 'src/stores/useTaskStore';
import { RootStackParamList } from 'src/constants/common.constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const tasks = useTaskStore((state) => state.tasks);
    const isLoading = useTaskStore((state) => state.isLoading);
    const error = useTaskStore((state) => state.error);
    const getTaskStats = useTaskStore((state) => state.getTaskStats);

    const stats = getTaskStats();

    const handleTaskPress = (taskId: string) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    const handleAddTask = () => {
        navigation.navigate('AddTask');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, styles.completedValue]}>{stats.completed}</Text>
                        <Text style={styles.statLabel}>Completadas</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, styles.pendingValue]}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pendientes</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                    <Text style={styles.addButtonText}>+ Nueva Tarea</Text>
                </TouchableOpacity>
            </View>
            
            <TaskList 
                tasks={tasks} 
                loading={isLoading} 
                error={error}
                onTaskPress={handleTaskPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    completedValue: {
        color: '#10b981',
    },
    pendingValue: {
        color: '#f59e0b',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#0066cc',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default HomeScreen;
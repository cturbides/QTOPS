import React from 'react';
import HomeScreen from 'src/screens/Home';
import AddTaskScreen from 'src/screens/AddTask';
import TaskDetailScreen from 'src/screens/TaskDetail';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Tareas' }} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Nueva Tarea' }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalle de Tarea' }} />
    </Stack.Navigator>
);

export default StackNavigator;
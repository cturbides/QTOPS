import React from 'react';
import HomeScreen from 'src/screens/Home';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Tareas' }} />
    </Stack.Navigator>
);

export default StackNavigator;
import React from 'react';
import HomeScreen from 'src/screens/Home';
import UserDetailScreen from 'src/screens/UserDetail';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Usuarios' }} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: 'Detalle de Usuario' }} />
    </Stack.Navigator>
);

export default StackNavigator;
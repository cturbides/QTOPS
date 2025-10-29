import React from 'react';
import HomeScreen from 'src/screens/Home';
import LoginScreen from 'src/screens/Login';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
        />
        <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Home' }} 
        />
    </Stack.Navigator>
);

export default StackNavigator;
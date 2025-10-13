import React from 'react';
import HomeScreen from 'src/screens/Home';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        {/* Non tab screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

export default StackNavigator;
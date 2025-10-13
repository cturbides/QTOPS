import React from 'react';
import TabNavigator from './Tab';
import HomeScreen from 'src/screens/Home';
import DetailsScreen from 'src/screens/Form';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        {/* Non tab screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
);

export default StackNavigator;
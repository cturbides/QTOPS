import React from 'react';
import HomeScreen from 'src/screens/Home';
import FormScreen from 'src/screens/Form';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Form" component={FormScreen} />
    </Tab.Navigator>
);

export default TabNavigator;
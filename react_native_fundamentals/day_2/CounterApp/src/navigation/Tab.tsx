import React from 'react';
import HomeScreen from 'src/screens/Home';
import ProfileScreen from 'src/screens/Profile';
import DetailsScreen from 'src/screens/Details';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Details" component={DetailsScreen} />
    </Tab.Navigator>
);

export default TabNavigator;
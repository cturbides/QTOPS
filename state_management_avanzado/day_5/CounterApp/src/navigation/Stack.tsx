import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import HomeScreen from 'src/screens/Home';
import SettingsScreen from 'src/screens/Settings';
import UserDetailScreen from 'src/screens/UserDetail';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={({ navigation }) => ({
                title: 'Usuarios',
                headerRight: () => (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Settings')}
                        style={{ marginRight: 16 }}
                    >
                        <Text style={{ fontSize: 20 }}>⚙️</Text>
                    </TouchableOpacity>
                ),
            })} 
        />
        <Stack.Screen 
            name="UserDetail" 
            component={UserDetailScreen} 
            options={{ title: 'Detalle de Usuario' }} 
        />
        <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Configuración' }} 
        />
    </Stack.Navigator>
);

export default StackNavigator;
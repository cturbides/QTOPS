import React from 'react';
import { View, Text } from 'react-native';

export default function TaskListEmpty() {
    return (
        <View style={{ paddingVertical: 16 }}>
            <Text>No hay tareas</Text>
        </View>
    );
}

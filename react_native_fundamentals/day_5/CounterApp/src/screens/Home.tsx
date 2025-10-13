import React from 'react';
import { View } from 'react-native';

import TaskList from 'src/components/TaskList';

const HomeScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TaskList />
        </View>
    );
}

export default HomeScreen;
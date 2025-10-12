import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }: any) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home Screen</Text>
        <Button
            title="Ir a Detalles"
            onPress={() => navigation.navigate('Details')}
        />
    </View>
);

export default HomeScreen;
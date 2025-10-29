import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HeavyComponent: React.FC = () => {
    React.useEffect(() => {
        console.log('HeavyComponent cargado exitosamente');
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Componente cargado</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#0ea5e9',
        margin: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0c4a6e',
        marginBottom: 8,
    },
});

export default HeavyComponent;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CounterDisplayProps } from './CounterDisplayProps.interface';

const CounterDisplay: React.FC<CounterDisplayProps> = ({ count, title = 'Contador' }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.count}>{count}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 18, marginBottom: 8 },
    count: { fontSize: 48, fontWeight: '600' },
});

export default CounterDisplay;

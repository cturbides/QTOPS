import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { CounterControlsProps } from './CounterControlsProps.interface';

const CounterControls: React.FC<CounterControlsProps> = ({ onIncrement, onDecrement, onReset }) => {
    return (
        <View style={styles.row}>
            <View style={styles.button}><Button title="-" onPress={onDecrement} /></View>
            <View style={styles.button}><Button title="Reset" onPress={onReset} /></View>
            <View style={styles.button}><Button title="+" onPress={onIncrement} /></View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
    button: { flex: 1, marginHorizontal: 8 },
});

export default CounterControls;

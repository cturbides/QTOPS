import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput } from 'react-native';
import { CounterControlsProps } from './CounterControlsProps.interface';

const CounterControls: React.FC<CounterControlsProps> = ({ onIncrement, onDecrement, onReset, onIncrementByAmount }) => {
    const [amount, setAmount] = useState<string>('5');

    const parsed = Number(amount);
    const canAdd = onIncrementByAmount && !Number.isNaN(parsed);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.button}><Button title="-" onPress={onDecrement} /></View>
                <View style={styles.button}><Button title="Reset" onPress={onReset} /></View>
                <View style={styles.button}><Button title="+" onPress={onIncrement} /></View>
            </View>

            {onIncrementByAmount ? (
                <View style={styles.addRow}>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="Amount"
                        returnKeyType="done"
                    />
                    <View style={styles.smallButton}>
                        <Button title="Add" onPress={() => onIncrementByAmount(parsed)} disabled={!canAdd} />
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%' },
    row: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 12 },
    addRow: { flexDirection: 'row', width: '100%', alignItems: 'center' },
    button: { flex: 1, marginHorizontal: 8 },
    smallButton: { width: 80, marginLeft: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 8, height: 40 },
});

export default CounterControls;

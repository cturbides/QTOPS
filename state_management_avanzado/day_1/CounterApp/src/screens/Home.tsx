import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import CounterDisplay from 'src/components/CounterDisplay';
import CounterControls from 'src/components/CounterControls';

const HomeScreen: React.FC = () => {
    const [count, setCount] = useState<number>(0);

    const increment = () => setCount(c => c + 1);
    const decrement = () => setCount(c => c - 1);
    const reset = () => setCount(0);

    return (
        <View style={styles.container}>
            <CounterDisplay count={count} title="Contador simple" />
            <CounterControls onIncrement={increment} onDecrement={decrement} onReset={reset} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default HomeScreen;
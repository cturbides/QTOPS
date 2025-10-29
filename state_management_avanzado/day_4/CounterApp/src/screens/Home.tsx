import React from 'react';
import { View, StyleSheet } from 'react-native';

import CounterDisplay from 'src/components/CounterDisplay';
import CounterControls from 'src/components/CounterControls';
import { useCounter } from 'src/contexts/CounterContext';

const HomeScreen: React.FC = () => {
    const { count, increment, decrement, reset, incrementBy } = useCounter();

    return (
        <View style={styles.container}>
            <CounterDisplay count={count} title="Contador simple" />
            <CounterControls
                onIncrement={increment}
                onDecrement={decrement}
                onReset={reset}
                onIncrementByAmount={incrementBy}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default HomeScreen;
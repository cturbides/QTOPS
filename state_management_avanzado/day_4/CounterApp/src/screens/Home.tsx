import React from 'react';
import { View, StyleSheet } from 'react-native';

import CounterDisplay from 'src/components/CounterDisplay';
import CounterControls from 'src/components/CounterControls';
import { useCounterStore } from 'src/store/useCounterStore';

const HomeScreen: React.FC = () => {
    const count = useCounterStore(state => state.count);
    const increment = useCounterStore(state => state.increment);
    const decrement = useCounterStore(state => state.decrement);
    const reset = useCounterStore(state => state.reset);
    const incrementBy = useCounterStore(state => state.incrementBy);

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
import React from 'react';
import { View, StyleSheet } from 'react-native';

import CounterDisplay from 'src/components/CounterDisplay';
import CounterControls from 'src/components/CounterControls';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { increment, decrement, reset, incrementByAmount } from 'src/store/counterSlice';

const HomeScreen: React.FC = () => {
    const count = useAppSelector(state => state.counter.value);
    const dispatch = useAppDispatch();

    const handleIncrement = () => dispatch(increment());
    const handleDecrement = () => dispatch(decrement());
    const handleReset = () => dispatch(reset());
    const handleIncrementByAmount = (amount: number) => dispatch(incrementByAmount(amount));

    return (
        <View style={styles.container}>
            <CounterDisplay count={count} title="Contador simple" />
            <CounterControls
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onReset={handleReset}
                onIncrementByAmount={handleIncrementByAmount}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default HomeScreen;
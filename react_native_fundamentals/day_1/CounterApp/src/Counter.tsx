import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Counter: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <View style={styles.container}>
            <Text style={styles.count}>{count}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCount(count + 1)}
            >
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>


            {/* Added button*/}
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCount(count - 1)}
            >
                <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    count: { fontSize: 48, fontWeight: 'bold', marginBottom: 20 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 18 }
});

export default Counter;
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>¡Hola!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default HomeScreen;
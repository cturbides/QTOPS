import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import StackNavigator from 'src/navigation/Stack';
import { CounterProvider } from 'src/contexts/CounterContext';

export default function App() {
  return (
    <CounterProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </CounterProvider>
  );
}
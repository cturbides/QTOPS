import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { ThemeProvider } from 'src/theme/ThemeContext';
import StackNavigator from 'src/navigation/Stack';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
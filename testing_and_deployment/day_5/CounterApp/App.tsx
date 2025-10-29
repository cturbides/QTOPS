import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';

import StackNavigator from 'src/navigation/Stack';
import { initializeSentry } from 'src/utils/sentry';
import { initializeAnalytics } from 'src/utils/analytics';

initializeSentry();

function App() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);
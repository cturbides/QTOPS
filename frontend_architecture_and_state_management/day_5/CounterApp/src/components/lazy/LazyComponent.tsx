import React, { Suspense, lazy } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0ea5e9" />
    <Text style={styles.loadingText}>Cargando componente...</Text>
  </View>
);

const LazyComponent: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HeavyComponent />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default LazyComponent;

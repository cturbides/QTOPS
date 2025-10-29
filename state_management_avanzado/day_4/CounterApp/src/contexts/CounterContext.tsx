import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);
  const incrementBy = useCallback((amount: number) => setCount(c => c + amount), []);

  const contextValue = useMemo(
    () => ({
      count,
      increment,
      decrement,
      reset,
      incrementBy,
    }),
    [count, increment, decrement, reset, incrementBy]
  );

  return (
    <CounterContext.Provider value={contextValue}>
      {children}
    </CounterContext.Provider>
  );
};

export const useCounter = () => {
  const context = useContext(CounterContext);

  if (!context) {
    throw new Error('useCounter must be used within CounterProvider');
  }

  return context;
};

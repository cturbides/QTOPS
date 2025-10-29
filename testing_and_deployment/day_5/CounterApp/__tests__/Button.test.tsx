import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/components/Button';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Press me" onPress={mockOnPress} />
    );

    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button title="Press me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Press me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Press me" onPress={mockOnPress} loading />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Press me')).toBeNull();
  });

  it('is disabled when loading', () => {
    const { getByTestId } = render(
      <Button title="Press me" onPress={mockOnPress} loading />
    );

    fireEvent.press(getByTestId('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});

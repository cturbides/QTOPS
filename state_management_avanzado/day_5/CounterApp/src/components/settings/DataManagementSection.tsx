import React from 'react';
import { STORAGE_LABELS } from 'src/constants/storage.constants';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { DataManagementSectionProps } from './props.interface';

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  isClearing,
  onClearCache,
  onClearAll,
  onRefresh,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{STORAGE_LABELS.SECTION_TITLES.DATA_MANAGEMENT}</Text>

      <TouchableOpacity
        style={[styles.button, styles.warningButton]}
        onPress={onClearCache}
        disabled={isClearing}
      >
        <Text style={styles.buttonText}>
          {isClearing ? STORAGE_LABELS.BUTTON_LABELS.CLEARING : STORAGE_LABELS.BUTTON_LABELS.CLEAR_CACHE}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={onClearAll}
        disabled={isClearing}
      >
        <Text style={styles.buttonText}>
          {isClearing ? STORAGE_LABELS.BUTTON_LABELS.CLEARING : STORAGE_LABELS.BUTTON_LABELS.CLEAR_ALL}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={onRefresh}
        disabled={isClearing}
      >
        <Text style={styles.buttonText}>{STORAGE_LABELS.BUTTON_LABELS.REFRESH}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DataManagementSection;

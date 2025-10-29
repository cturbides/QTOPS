import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STORAGE_LABELS } from 'src/constants/storage.constants';

const InfoSection: React.FC = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{STORAGE_LABELS.SECTION_TITLES.INFO}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>{STORAGE_LABELS.INFO_TEXT}</Text>
      </View>
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default InfoSection;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STORAGE_LABELS } from 'src/constants/storage.constants';
import { formatTimestamp, getCacheAge } from 'src/utils/format.utils';

import { StorageInfoCardProps } from './props.interface';

const StorageInfoCard: React.FC<StorageInfoCardProps> = ({ storageInfo }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{STORAGE_LABELS.SECTION_TITLES.STORAGE_INFO}</Text>

            <View style={styles.infoCard}>
                <InfoRow
                    label={STORAGE_LABELS.INFO_LABELS.TOTAL_KEYS}
                    value={storageInfo.totalKeys.toString()}
                />

                <InfoRow
                    label={STORAGE_LABELS.INFO_LABELS.USERS_IN_CACHE}
                    value={storageInfo.usersCount.toString()}
                />

                <InfoRow
                    label={STORAGE_LABELS.INFO_LABELS.CACHE_STATUS}
                    value={storageInfo.cacheValid ? STORAGE_LABELS.STATUS.VALID : STORAGE_LABELS.STATUS.EXPIRED}
                    valueStyle={storageInfo.cacheValid ? styles.cacheValid : styles.cacheInvalid}
                />

                <InfoRow
                    label={STORAGE_LABELS.INFO_LABELS.LAST_UPDATE}
                    value={formatTimestamp(storageInfo.cacheTimestamp)}
                />

                <InfoRow
                    label={STORAGE_LABELS.INFO_LABELS.CACHE_AGE}
                    value={getCacheAge(storageInfo.cacheTimestamp)}
                />
            </View>
        </View>
    );
};

interface InfoRowProps {
    label: string;
    value: string;
    valueStyle?: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueStyle }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
);

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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    cacheValid: {
        color: '#4CAF50',
    },
    cacheInvalid: {
        color: '#f44336',
    },
});

export default StorageInfoCard;

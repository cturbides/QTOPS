import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStorageInfo } from 'src/hooks/useStorageInfo';
import StorageInfoCard from 'src/components/settings/StorageInfoCard';
import DataManagementSection from 'src/components/settings/DataManagementSection';
import InfoSection from 'src/components/settings/InfoSection';

const SettingsScreen: React.FC = () => {
    const {
        storageInfo,
        isClearing,
        loadStorageInfo,
        handleClearCache,
        handleClearAll,
    } = useStorageInfo();

    useFocusEffect(
        useCallback(() => {
            loadStorageInfo();
        }, [loadStorageInfo])
    );

    return (
        <ScrollView style={styles.container}>
            <StorageInfoCard storageInfo={storageInfo} />
            
            <DataManagementSection
                isClearing={isClearing}
                onClearCache={handleClearCache}
                onClearAll={handleClearAll}
                onRefresh={loadStorageInfo}
            />
            
            <InfoSection />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});

export default SettingsScreen;

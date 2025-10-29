import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import UserList from 'src/components/UserList';
import { useGetUsersQuery, isCacheValid } from 'src/services/userApi';
import { RootStackParamList } from 'src/constants/common.constants';
import { CACHE_INDICATORS } from 'src/constants/storage.constants';
import { ERROR_MESSAGES } from 'src/constants/messages.constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { data: users = [], isLoading, error, isFetching } = useGetUsersQuery();
    const [cacheStatus, setCacheStatus] = useState<boolean>(false);

    useEffect(() => {
        const checkCache = async () => {
            const isValid = await isCacheValid();
            setCacheStatus(isValid);
        };
        checkCache();
    }, [users]);

    const handleUserPress = (userId: number) => {
        navigation.navigate('UserDetail', { userId });
    };

    const getCacheIndicatorText = () => {
        if (isFetching) return CACHE_INDICATORS.UPDATING;
        return cacheStatus ? CACHE_INDICATORS.CACHED : CACHE_INDICATORS.SERVER;
    };

    return (
        <View style={styles.container}>
            {/* Cache status indicator */}
            {!isLoading && users.length > 0 && (
                <View style={[
                    styles.cacheIndicator,
                    cacheStatus ? styles.cacheValid : styles.cacheInvalid
                ]}>
                    <Text style={styles.cacheText}>{getCacheIndicatorText()}</Text>
                </View>
            )}

            <UserList 
                users={users} 
                loading={isLoading} 
                error={error ? ERROR_MESSAGES.USERS.LOAD_ERROR : null}
                onUserPress={handleUserPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    cacheIndicator: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cacheValid: {
        backgroundColor: '#E8F5E9',
    },
    cacheInvalid: {
        backgroundColor: '#E3F2FD',
    },
    cacheText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
});

export default HomeScreen;
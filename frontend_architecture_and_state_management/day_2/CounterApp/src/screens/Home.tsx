import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import UserList from 'src/components/UserList';
import { useGetUsersQuery } from 'src/services/userApi';
import { RootStackParamList } from 'src/constants/common.constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { data: users = [], isLoading, error } = useGetUsersQuery();

    const handleUserPress = (userId: number) => {
        navigation.navigate('UserDetail', { userId });
    };

    return (
        <View style={styles.container}>
            <UserList 
                users={users} 
                loading={isLoading} 
                error={error ? 'Error al cargar usuarios' : null}
                onUserPress={handleUserPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default HomeScreen;
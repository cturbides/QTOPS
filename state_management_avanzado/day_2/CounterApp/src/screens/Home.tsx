import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import UserList from 'src/components/UserList';
import { loadUsers } from 'src/store/usersSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks';

const HomeScreen: React.FC = () => {
    const { users, loading, error } = useAppSelector(state => state.users);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(loadUsers());
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <UserList users={users} loading={loading} error={error} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default HomeScreen;
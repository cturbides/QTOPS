import React from 'react';
import { View, Text } from 'react-native';

import UserInfo from 'src/components/UserInfo';
import HomeActions from 'src/components/HomeActions';
import { useUserData } from 'src/hooks/use-user-data.hook';
import { useRefreshOnFocus } from 'src/hooks/use-refresh-on-focus.hook';

const HomeScreen = ({ navigation }: any) => {
    const { userData, loading, deleting, refresh, confirmAndDelete } = useUserData();

    useRefreshOnFocus(refresh);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 12, fontSize: 18 }}>Pantalla principal</Text>

            <UserInfo loading={loading} userData={userData} />

            <HomeActions
                canDelete={!!userData}
                deleting={deleting}
                onDelete={confirmAndDelete}
                onGoToForm={() => navigation.navigate('Form')}
            />
        </View>
    );
}

export default HomeScreen;
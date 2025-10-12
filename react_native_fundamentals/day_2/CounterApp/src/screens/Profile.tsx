import React from 'react';
import { View, Text, Button } from 'react-native';

const Profile = ({ navigation }: any) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Profile Screen</Text>
        <Button
            title="Go to Details"
            onPress={() => navigation.navigate('Details')}
        />
    </View>
);

export default Profile;
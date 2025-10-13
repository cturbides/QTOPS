import React from 'react';
import { View, Text } from 'react-native';
import { UserInfoProps } from './UserInfoProps.interface';

export default function UserInfo({ loading, userData }: UserInfoProps) {
    if (loading) {
        return <Text>Cargando...</Text>;
    }

    if (!userData) {
        return <Text>No hay datos de usuario guardados.</Text>;
    }

    return (
        <View style={{ alignItems: 'center', gap: 4 }}>
            <Text>Bienvenido, {userData.name}!</Text>
            <Text>Correo: {userData.email}</Text>
        </View>
    );
}

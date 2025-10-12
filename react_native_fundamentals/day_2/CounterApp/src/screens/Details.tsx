import React from 'react';
import { View, Text, Button } from 'react-native';

const DetailsScreen = ({ navigation }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Details Screen</Text>
    <Button
      title="Ir a Perfil"
      onPress={() => navigation.navigate('Profile')}
    />

    <Button
      title="Volver"
      onPress={() => navigation.goBack()}
    />
  </View>
);

export default DetailsScreen;
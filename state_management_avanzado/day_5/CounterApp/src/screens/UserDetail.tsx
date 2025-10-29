import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useGetUserByIdQuery } from 'src/services/userApi';
import { UserDetailProps } from 'src/types/user-details.type';


const UserDetailScreen: React.FC<UserDetailProps> = ({ route }) => {
  const { userId } = route.params;
  const { data: user, isLoading, error } = useGetUserByIdQuery(userId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar usuario</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        <Text style={styles.detail}>📧 {user.email}</Text>
        <Text style={styles.detail}>📞 {user.phone}</Text>
        <Text style={styles.detail}>🌐 {user.website}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección</Text>
        <Text style={styles.detail}>{user.address.street}, {user.address.suite}</Text>
        <Text style={styles.detail}>{user.address.city} - {user.address.zipcode}</Text>
        <Text style={styles.detail}>📍 Lat: {user.address.geo.lat}, Lng: {user.address.geo.lng}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compañía</Text>
        <Text style={styles.companyName}>🏢 {user.company.name}</Text>
        <Text style={styles.detail}>"{user.company.catchPhrase}"</Text>
        <Text style={styles.detailSmall}>{user.company.bs}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  detailSmall: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 6,
  },
});

export default UserDetailScreen;

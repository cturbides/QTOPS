import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserCardProps } from './UserCardProps.interface';

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      <Text style={styles.detail}>📧 {user.email}</Text>
      <Text style={styles.detail}>📞 {user.phone}</Text>
      <Text style={styles.detail}>🌐 {user.website}</Text>
      <Text style={styles.company}>🏢 {user.company.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default UserCard;

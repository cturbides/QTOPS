import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Alert,
  Platform,
  Keyboard,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';

import validateEmail from 'src/helpers/validate-email.helper';
import { saveUserData } from 'src/helpers/crud-user-data.helper';
import validateUsername from 'src/helpers/validate-username.helper';

const Form: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres y no contener espacios ni caracteres especiales.');
      return;
    }

    try {
      await saveUserData(username, email);

      Alert.alert('Login', `Email: ${email}\nUsername: ${username}`);

      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.form}>
            <Text style={styles.title}>Guardar datos de usuario</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType='emailAddress'
              returnKeyType='next'
              accessible={true}
              accessibilityLabel='Campo de correo electronico'
              accessibilityHint='Ingresa tu direccion de correo electronico'
              autoComplete='email'
            />

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              textContentType='username'
              onSubmitEditing={handleSubmit}
              returnKeyType='done'
              accessible={true}
              accessibilityLabel='Campo de nombre de usuario'
              accessibilityHint='Ingresa tu nombre de usuario'
              autoComplete='username'
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Guardar datos</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardView: { flex: 1 },
  form: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default Form;
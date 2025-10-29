import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/constants/common.constants';
import { useTaskStore } from 'src/stores/useTaskStore';
import TaskFormInput from 'src/components/add-task/TaskFormInput';
import TaskFormActions from 'src/components/add-task/TaskFormActions';

type AddTaskScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTask'>;

const AddTaskScreen: React.FC = () => {
  const navigation = useNavigation<AddTaskScreenNavigationProp>();
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('1');
  const addTask = useTaskStore((state) => state.addTask);

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título de la tarea no puede estar vacío');
      return;
    }

    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber) || userIdNumber < 1) {
      Alert.alert('Error', 'El ID de usuario debe ser un número válido mayor a 0');
      return;
    }

    addTask(title.trim(), userIdNumber);
    Alert.alert('Éxito', 'Tarea creada exitosamente', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TaskFormInput
          label="Título de la Tarea *"
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Completar el proyecto de React Native"
          multiline
          numberOfLines={3}
          maxLength={200}
          hint={`${title.length}/200 caracteres`}
        />

        <TaskFormInput
          label="ID de Usuario"
          value={userId}
          onChangeText={setUserId}
          placeholder="1"
          keyboardType="number-pad"
          maxLength={5}
          hint="Identificador del usuario propietario"
        />

        <TaskFormActions
          onSubmit={handleAddTask}
          onCancel={() => navigation.goBack()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
});

export default AddTaskScreen;

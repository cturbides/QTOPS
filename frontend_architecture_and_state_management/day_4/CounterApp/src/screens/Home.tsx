import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import HeaderOrganism from 'src/components/organisms/HeaderOrganism';
import CardMolecule from 'src/components/molecules/CardMolecule';
import FormFieldMolecule from 'src/components/molecules/FormFieldMolecule';
import TextAtom from 'src/components/atoms/TextAtom';
import ButtonAtom from 'src/components/atoms/ButtonAtom';

const HomeScreen: React.FC = () => {
  const { tokens } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(text.length > 0 && !emailRegex.test(text));
  };

  const handleSubmit = () => {
    if (name && email && !emailError) {
      Alert.alert('Éxito', `¡Hola ${name}! Email: ${email}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.background }]}>
      <HeaderOrganism title="Design System Demo" />

      <ScrollView contentContainerStyle={styles.content}>
        <CardMolecule padding="large">
          <TextAtom variant="h2" weight="bold" style={{ marginBottom: tokens.spacing.medium }}>
            Tipografía
          </TextAtom>
          <TextAtom variant="h3">Heading 3</TextAtom>
          <TextAtom variant="body" style={{ marginTop: tokens.spacing.small }}>
            Este es un texto body usando design tokens. Los tokens aseguran consistencia
            en toda la aplicación.
          </TextAtom>
          <TextAtom
            variant="caption"
            color="textSecondary"
            style={{ marginTop: tokens.spacing.small }}
          >
            Este es un caption secundario
          </TextAtom>
        </CardMolecule>

        <CardMolecule padding="large" elevated style={{ marginTop: tokens.spacing.medium }}>
          <TextAtom variant="h2" weight="bold" style={{ marginBottom: tokens.spacing.medium }}>
            Formulario
          </TextAtom>

          <FormFieldMolecule
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ingresa tu nombre"
            required
          />

          <FormFieldMolecule
            label="Email"
            value={email}
            onChangeText={validateEmail}
            placeholder="correo@ejemplo.com"
            error={emailError}
            errorMessage="Por favor ingresa un email válido"
            required
          />

          <View style={{ marginTop: tokens.spacing.large }}>
            <ButtonAtom
              title="Enviar"
              onPress={handleSubmit}
              fullWidth
              disabled={!name || !email || emailError}
            />
          </View>
        </CardMolecule>

        <CardMolecule padding="large" elevated style={{ marginTop: tokens.spacing.medium }}>
          <TextAtom variant="h2" weight="bold" style={{ marginBottom: tokens.spacing.medium }}>
            Botones
          </TextAtom>

          <View style={{ gap: tokens.spacing.small }}>
            <ButtonAtom title="Primary Button" onPress={() => {}} variant="primary" fullWidth />
            <ButtonAtom
              title="Secondary Button"
              onPress={() => {}}
              variant="secondary"
              fullWidth
            />
            <ButtonAtom title="Outline Button" onPress={() => {}} variant="outline" fullWidth />
            <ButtonAtom title="Danger Button" onPress={() => {}} variant="danger" fullWidth />
            <ButtonAtom title="Disabled Button" onPress={() => {}} disabled fullWidth />
          </View>
        </CardMolecule>

        <CardMolecule padding="large" elevated style={{ marginTop: tokens.spacing.medium }}>
          <TextAtom variant="h2" weight="bold" style={{ marginBottom: tokens.spacing.medium }}>
            Colores
          </TextAtom>

          <View style={{ gap: tokens.spacing.small }}>
            <TextAtom color="primary">Color Primario (#007AFF)</TextAtom>
            <TextAtom color="error">Color Error (#FF3B30)</TextAtom>
            <TextAtom color="success">Color Success (#34C759)</TextAtom>
            <TextAtom color="textSecondary">Color Texto Secundario</TextAtom>
          </View>
        </CardMolecule>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});

export default HomeScreen;
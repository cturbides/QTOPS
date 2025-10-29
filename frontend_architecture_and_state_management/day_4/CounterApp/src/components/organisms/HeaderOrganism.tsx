import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'src/theme/ThemeContext';
import TextAtom from 'src/components/atoms/TextAtom';
import ButtonAtom from 'src/components/atoms/ButtonAtom';
import { HeaderOrganismProps } from './HeaderOrganism.interface';

const HeaderOrganism: React.FC<HeaderOrganismProps> = ({
  title,
  showThemeToggle = true,
}) => {
  const { theme, toggleTheme, tokens } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: tokens.colors.surface,
          paddingHorizontal: tokens.spacing.medium,
          paddingVertical: tokens.spacing.large,
          ...tokens.shadows.small,
        },
      ]}
    >
      <TextAtom variant="h2" weight="bold">
        {title}
      </TextAtom>

      {showThemeToggle && (
        <View style={styles.actions}>
          <ButtonAtom
            title={theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
            onPress={toggleTheme}
            variant="outline"
            size="small"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default HeaderOrganism;

import React from 'react';
import { View, Button } from 'react-native';
import { HomeActionsProps } from './HomeActionsProps.interface';

export default function HomeActions({ canDelete, deleting, onDelete, onGoToForm }: HomeActionsProps) {
    return (
        <View style={{ marginTop: 16, gap: 8, width: 220 }}>
            <Button title="Ir a formulario" onPress={onGoToForm} />

            {canDelete && (
                <Button
                    color="#d9534f"
                    disabled={deleting}
                    onPress={onDelete}
                    title={deleting ? 'Eliminando...' : 'Eliminar datos'}
                />
            )}

        </View>
    );
}

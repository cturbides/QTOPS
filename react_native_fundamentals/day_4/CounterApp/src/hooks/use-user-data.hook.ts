import { Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { getUserData, deleteUserData } from 'src/helpers/crud-user-data.helper';

export function useUserData(): {
    userData: { name: string; email: string } | null;
    loading: boolean;
    deleting: boolean;
    refresh: () => Promise<void>;
    confirmAndDelete: () => void;
} {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUserData();
            setUserData(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmAndDelete = useCallback(() => {
        if (!userData) return;
        Alert.alert(
            'Eliminar datos',
            '¿Seguro que quieres borrar los datos guardados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteUserData();
                            await refresh();
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    }, [userData, refresh]);

    return { userData, loading, deleting, refresh, confirmAndDelete };
}

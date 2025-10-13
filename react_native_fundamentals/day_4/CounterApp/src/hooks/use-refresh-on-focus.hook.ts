import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Ejecuta una función asincrónica cada vez que la pantalla gana foco.
 * Ideal para refrescar datos desde AsyncStorage o API.
 *
 * @param refreshFn Función asincrónica que recarga datos
 */
export function useRefreshOnFocus(refreshFn: () => Promise<void>) {
    useFocusEffect(
        useCallback(() => {
            let alive = true;

            (async () => {
                if (alive) await refreshFn();
            })();

            // marca "no vivo" cuando la pantalla pierde foco
            return () => {
                alive = false;
            };
        }, [refreshFn])
    );
}

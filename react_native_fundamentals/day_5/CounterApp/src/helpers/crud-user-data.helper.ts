import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserData = async (name: string, email: string) => {
    try {
        const userData = { name, email, timestamp: Date.now() };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('Datos guardados correctamente');
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
};

export const getUserData = async () => {
    try {
        const data = await AsyncStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error obteniendo datos:', error);
        return null;
    }
};

export const deleteUserData = async () => {
    try {
        await AsyncStorage.removeItem('userData');
        console.log('Datos eliminados correctamente');
    } catch (error) {
        console.error('Error eliminando datos:', error);
    }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key "${key}":`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

export const getMultiple = async <T>(keys: string[]): Promise<Record<string, T | null>> => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, T | null> = {};
    
    pairs.forEach(([key, value]) => {
      result[key] = value ? JSON.parse(value) : null;
    });
    
    return result;
  } catch (error) {
    console.error('Error getting multiple keys:', error);
    return {};
  }
};

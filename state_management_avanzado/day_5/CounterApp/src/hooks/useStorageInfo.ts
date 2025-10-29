import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { CacheInfo } from 'src/types/cache-info.type';
import { getAllKeys, getData, removeData, clearAll } from 'src/services/storage';
import { STORAGE_KEYS } from 'src/constants/common.constants';
import { CACHE_DURATION, ALERT_MESSAGES } from 'src/constants/storage.constants';
import { isCacheStillValid } from 'src/utils/format.utils';

export const useStorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState<CacheInfo>({
    totalKeys: 0,
    usersCount: 0,
    cacheValid: false,
    cacheTimestamp: null,
  });
  const [isClearing, setIsClearing] = useState(false);

  const loadStorageInfo = useCallback(async () => {
    try {
      const keys = await getAllKeys();
      const timestamp = await getData<number>(STORAGE_KEYS.USERS_CACHE_TIMESTAMP);
      const users = await getData<any[]>(STORAGE_KEYS.USERS_CACHE);

      const cacheValid = isCacheStillValid(timestamp, CACHE_DURATION);

      setStorageInfo({
        totalKeys: keys.length,
        cacheTimestamp: timestamp,
        cacheValid,
        usersCount: users?.length || 0,
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      ALERT_MESSAGES.CLEAR_CACHE.TITLE,
      ALERT_MESSAGES.CLEAR_CACHE.MESSAGE,
      [
        { text: ALERT_MESSAGES.BUTTON_LABELS.CANCEL, style: 'cancel' },
        {
          text: ALERT_MESSAGES.BUTTON_LABELS.CLEAR,
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await removeData(STORAGE_KEYS.USERS_CACHE);
              await removeData(STORAGE_KEYS.USERS_CACHE_TIMESTAMP);
              await loadStorageInfo();
              Alert.alert('Éxito', ALERT_MESSAGES.CLEAR_CACHE.SUCCESS);
            } catch (error) {
              Alert.alert('Error', ALERT_MESSAGES.CLEAR_CACHE.ERROR);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [loadStorageInfo]);

  const handleClearAll = useCallback(async () => {
    Alert.alert(
      ALERT_MESSAGES.CLEAR_ALL.TITLE,
      ALERT_MESSAGES.CLEAR_ALL.MESSAGE,
      [
        { text: ALERT_MESSAGES.BUTTON_LABELS.CANCEL, style: 'cancel' },
        {
          text: ALERT_MESSAGES.BUTTON_LABELS.DELETE_ALL,
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearAll();
              await loadStorageInfo();
              Alert.alert('Éxito', ALERT_MESSAGES.CLEAR_ALL.SUCCESS);
            } catch (error) {
              Alert.alert('Error', ALERT_MESSAGES.CLEAR_ALL.ERROR);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [loadStorageInfo]);

  return {
    storageInfo,
    isClearing,
    loadStorageInfo,
    handleClearCache,
    handleClearAll,
  };
};

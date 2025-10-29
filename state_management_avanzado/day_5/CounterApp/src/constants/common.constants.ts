export type RootStackParamList = {
    Home: undefined;
    Settings: undefined;
    UserDetail: { userId: number };
};

export const STORAGE_KEYS = {
    APP_STATE: 'app_state',
    USERS_CACHE: 'users_cache',
    USER_PREFERENCES: 'user_preferences',
    USERS_CACHE_TIMESTAMP: 'users_cache_timestamp',
} as const;

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
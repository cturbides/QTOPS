// Placeholder analytics implementation
// TODO: Configure Firebase native modules properly

export const initializeAnalytics = async () => {
  console.log('[Analytics] Initialized (placeholder)');
};

export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  console.log(`[Analytics] Event: ${eventName}`, params);
};

export const logScreenView = async (screenName: string) => {
  console.log(`[Analytics] Screen view: ${screenName}`);
};

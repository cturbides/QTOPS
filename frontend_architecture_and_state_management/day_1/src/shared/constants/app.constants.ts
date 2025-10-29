/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://api.example.com',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  USER: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  USER_NOT_FOUND: 'User not found',
  SERVER_ERROR: 'An error occurred. Please try again later',
  NETWORK_ERROR: 'Network connection failed',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
} as const;

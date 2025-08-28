// Service Discovery Constants
export const DEFAULT_TTL_PER_MSG: number = 5000; // 5 seconds
export const DEFAULT_CONSUL_HOST: string = 'localhost';
export const DEFAULT_CONSUL_PORT: number = 8500;

// Health Check Constants
export const DATABASE_CONNECTION_CHECK_NAME: string = 'database-connection';
export const COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME: string = 'course-content-accessibility';

// Service Types
export enum ServiceType {
  COURSE_SERVICE = 'course-service',
  CATALOG_SERVICE = 'catalog-service',
  USER_SERVICE = 'user-service',
  NOTIFICATION_SERVICE = 'notification-service'
}
export {};
// This file is used to declare global types and interfaces for the application.

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'staging' | 'production' | 'test';
            DATABASE_URL: string;
            JWT_SECRET: string;
            EMAIL_SERVICE_API_KEY: string;
            REDIS_URL: string;
        }
    }

}

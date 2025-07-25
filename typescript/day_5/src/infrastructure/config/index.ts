export namespace Config {
    export interface DatabaseConfig {
        url: string;
        maxConnections: number;
        timeout: number;
    }

    export interface RedisConfig {
        url: string;
        ttl: number;
    }

    export interface EmailConfig {
        apiKey: string;
        fromAddress: string;
        templates: {
            welcome: string;
            passwordReset: string;
        };
    }

    export interface AppConfig {
        env: 'development' | 'production' | 'test';
        port: number;
        database: DatabaseConfig;
        redis: RedisConfig;
        email: EmailConfig;
        jwt: {
            secret: string;
            expiresIn: string;
        };
    }

    export function loadConfig(): AppConfig {
        return {
            env: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
            port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
            database: {
                url: process.env.DATABASE_URL || 'mongodb://localhost:27017/myapp',
                maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
                timeout: parseInt(process.env.DB_TIMEOUT || '5000')
            },
            redis: {
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                ttl: parseInt(process.env.REDIS_TTL || '3600')
            },
            email: {
                apiKey: process.env.EMAIL_SERVICE_API_KEY || 'default',
                fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
                templates: {
                    welcome: 'welcome-template',
                    passwordReset: 'password-reset-template'
                }
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'default',
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        };
    }
}
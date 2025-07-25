import { Config } from '@infrastructure/config';

export namespace Adapters {
    export interface EmailAdapter {
        sendEmail(to: string, template: string, data: any): Promise<void>;
    }

    export interface CacheAdapter {
        get<T>(key: string): Promise<T | null>;
        set<T>(key: string, value: T, ttl?: number): Promise<void>;
        delete(key: string): Promise<void>;
    }

    export class SendGridEmailAdapter implements EmailAdapter {
        constructor(private config: Config.EmailConfig) { }

        async sendEmail(to: string, template: string, data: any): Promise<void> {
            // SendGrid implementation
            console.log(`Sending email to ${to} using template ${template}`);
        }
    }

    export class RedisAdapter implements CacheAdapter {
        constructor(private config: Config.RedisConfig) { }

        async get<T>(key: string): Promise<T | null> {
            // Redis implementation
            return null;
        }

        async set<T>(key: string, value: T, ttl?: number): Promise<void> {
            // Redis implementation
            console.log(`Caching ${key} for ${ttl || this.config.ttl} seconds`);
        }

        async delete(key: string): Promise<void> {
            // Redis implementation
            console.log(`Deleting cache key: ${key}`);
        }
    }
}
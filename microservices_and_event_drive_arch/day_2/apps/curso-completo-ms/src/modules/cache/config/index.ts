import * as redisStore from "cache-manager-ioredis";
import { CacheModuleOptions } from "@nestjs/cache-manager";
import { DEFAULT_CACHE_HOST, DEFAULT_CACHE_TTL } from "./constants/common";

export const cacheModuleOptions: CacheModuleOptions = {
    store: redisStore,
    ttl: DEFAULT_CACHE_TTL,
    host: DEFAULT_CACHE_HOST,
}
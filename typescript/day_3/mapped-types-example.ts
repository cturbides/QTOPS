// Task: Extiende este sistema para incluir mapped types que
//  creen validation functions automáticamente para cada property
//  type.

import * as crypto from "crypto";
import { validateHeaderName } from "http";

// Domain model complejo con union types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface Product extends BaseEntity {
  type: 'product';
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  metadata: {
    weight: number;
    dimensions: { width: number; height: number; depth: number };
    tags: string[];
  };
}

interface Service extends BaseEntity {
  type: 'service';
  name: string;
  hourlyRate: number;
  category: 'Software' | 'Design';
  available: boolean;
  metadata: {
    duration: number;
    requirements: string[];
    location: 'remote' | 'onsite' | 'hybrid';
  };
}

interface Subscription extends BaseEntity {
  type: 'subscription';
  name: string;
  monthlyPrice: number;
  category: string;
  active: boolean;
  metadata: {
    features: string[];
    limits: { users: number; storage: number };
    billingCycle: 'monthly' | 'yearly';
  };
}

type CatalogItem = Product | Service | Subscription;

// Sistema de transformaciones usando mapped types y distributive conditional types

// 1. Crear API response types
type ToApiResponse<T> = T extends { type: infer U, id: string }
  ? {
    type: U;
    id: T['id'];
    data: Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>;
    meta: {
      createdAt: string;
      updatedAt: string;
      version: number;
    };
  }
  : never;

type CatalogApiResponses = ToApiResponse<CatalogItem>;

// 2. Crear update request types
type ToUpdateRequest<T> = T extends { type: infer U }
  ? {
    type: U;
    updates: Partial<Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>>;
    reason?: string;
  }
  : never;

type CatalogUpdateRequests = ToUpdateRequest<CatalogItem>;

// 3. Mapped type para crear validation schemas
type CreateValidationSchema<T> = {
  [K in keyof T]: T[K] extends string
  ? { type: 'string'; required: boolean; pattern?: RegExp }
  : T[K] extends number
  ? { type: 'number'; required: boolean; min?: number; max?: number }
  : T[K] extends boolean
  ? { type: 'boolean'; required: boolean }
  : T[K] extends Date
  ? { type: 'date'; required: boolean }
  : T[K] extends object
  ? { type: 'object'; required: boolean; schema: CreateValidationSchema<T[K]> }
  : { type: 'any'; required: boolean };
};

// 4. Distributive transformation para crear event types
type ToEventType<T> = T extends { type: infer U }
  ? {
    eventType: `${string & U}Changed`;
    entityId: string;
    changes: Partial<Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>>;
    metadata: {
      timestamp: Date;
      userId: string;
      source: string;
    };
  }
  : never;

type CatalogEvents = ToEventType<CatalogItem>;

// 5. Mapped type para crear getters y setters
type CreateAccessors<T> = {
  [K in keyof T as K extends 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'
  ? never
  : `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as K extends 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'
  ? never
  : `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// 6. Sistema de serialization
type CreateSerializers<T> = {
  [K in keyof T]: T[K] extends Date
  ? (value: T[K]) => string
  : T[K] extends object
  ? (value: T[K]) => Record<string, any>
  : (value: T[K]) => T[K];
};

// 7. Factory para crear instances
class CatalogItemFactory {
  static createProduct(data: Omit<Product, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>): Product {
    return {
      id: `product_${Date.now()}`,
      type: 'product',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data
    };
  }

  static createService(data: Omit<Service, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>): Service {
    return {
      id: `service_${Date.now()}`,
      type: 'service',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data
    };
  }

  static createSubscription(data: Omit<Subscription, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>): Subscription {
    return {
      id: `subscription_${Date.now()}`,
      type: 'subscription',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data
    };
  }
}

// 8. Type-safe processor que usa distributive conditional types
class CatalogProcessor {
  static processItem<T extends CatalogItem>(item: T): ToApiResponse<T> {
    const { id, type, createdAt, updatedAt, version, ...data } = item;

    return {
      type: type as any,
      id,
      data: data as any,
      meta: {
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        version
      }
    } as ToApiResponse<T>;
  }

  static createEvent<T extends CatalogItem>(
    item: T,
    changes: Partial<Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>>,
    userId: string
  ): ToEventType<T> {
    return {
      eventType: `${item.type}Changed` as any,
      entityId: item.id,
      changes,
      metadata: {
        timestamp: new Date(),
        userId,
        source: 'catalog-service'
      }
    } as ToEventType<T>;
  }
}



/*
  Codigo nuevo
*/

// Step 1: DEfine mapped type: CreateValidators<T>
type CreateValidators<T> = {
  [K in keyof T as `validate${Capitalize<string & K>}`]:
  T[K] extends string
  ? (value: string) => boolean
  : T[K] extends number
  ? (value: number) => boolean
  : T[K] extends Date
  ? (value: Date) => boolean
  : T[K] extends boolean
  ? (value: boolean) => boolean
  : T[K] extends Array<infer U>
  ? (value: T[K]) => boolean
  : T[K] extends Function ? (value: T[K]) => boolean
  : T[K] extends object
  ? CreateValidators<T[K]>
  : (value: T[K]) => boolean
}

type DistributiveValidators<T> = T extends any ? CreateValidators<SkipInfrastructureFields<T>> : never;

// Step 2: Apply to domain entities
type SkipInfrastructureFields<T> = Omit<T, keyof BaseEntity | 'type'>;

type ProductValidators = CreateValidators<SkipInfrastructureFields<Product>>;
type ServiceValidators = CreateValidators<SkipInfrastructureFields<Service>>;
type SubscriptionValidators = CreateValidators<SkipInfrastructureFields<Subscription>>;

type CatalogItemValidators = DistributiveValidators<CatalogItem>;

// Step 3: Make a default implementation with a function called
//  validateCatalogItem<T>()

const serviceValidators: ServiceValidators = {
  validateName: (value) => value.length > 0,
  validateHourlyRate: (value) => value > 0,
  validateCategory: (value) => ['Software', 'Design'].includes(value),
  validateAvailable: (value) => typeof value === 'boolean',
  validateMetadata: {
    validateDuration: (value) => value > 0,
    validateLocation: (value) => ['remote', 'onsite', 'hybrid'].includes(value),
    validateRequirements: (value: string[]) => Array.isArray(value),
  }
};

const productValidators: ProductValidators = {
  validateName: (v) => v.length > 0,
  validatePrice: (v) => v >= 0,
  validateCategory: (v) => typeof v === 'string',
  validateInStock: (v) => typeof v === 'boolean',
  validateMetadata: {
    validateWeight: (v) => v > 0,
    validateDimensions: {
      validateWidth: (v) => v > 0,
      validateHeight: (v) => v > 0,
      validateDepth: (v) => v > 0,
    },
    validateTags: (v) => Array.isArray(v) && v.every(tag => typeof tag === 'string'),
  }
};

const subscriptionValidators: SubscriptionValidators = {
  validateName: (v) => v.length > 0,
  validateMonthlyPrice: (v) => v >= 0,
  validateCategory: (v) => typeof v === 'string',
  validateActive: (v) => typeof v === 'boolean',
  validateMetadata: {
    validateFeatures: (v) => Array.isArray(v) && v.every(f => typeof f === 'string'),
    validateLimits: {
      validateUsers: (v) => v >= 1,
      validateStorage: (v) => v >= 0,
    },
    validateBillingCycle: (v) => ['monthly', 'yearly'].includes(v),
  }
};

const generateDefaultValidators = <T extends CatalogItem>(item: T): CatalogItemValidators => {
  switch (item.type) {
    case "product":
      return productValidators as ProductValidators;
    case "service":
      return serviceValidators as ServiceValidators;
    case "subscription":
      return subscriptionValidators as SubscriptionValidators;
    default:
      throw new Error(`Unsupported type '${(item as any)?.type}'`)
  }
}

const validateCatalogItem =
  <T extends CatalogItem>(item: T): { valid: boolean; errors: string[] } => {
    const validators = generateDefaultValidators(item);
    const errors: string[] = [];

    const validateRecursively = (
      obj: any,
      validatorObj: any,
      path: string[] = []
    ) => {
      for (const key in validatorObj) {
        const originalKey = key.startsWith('validate')
          ? key.charAt('validate'.length).toLowerCase() + key.slice('validate'.length + 1)
          : key;

        const value = obj?.[originalKey];
        const currentValidator = validatorObj[key];

        if (typeof currentValidator === "function") {
          const valid = currentValidator(value);
          if (!valid) {
            errors.push(`Validation failed at ${[...path, key].join(".")}`);
          }
        } else if (typeof currentValidator === "object") {
          validateRecursively(value, currentValidator, [...path, key]);
        }
      }
    }

    const plainItem = JSON.parse(JSON.stringify(item)) as any;
    delete plainItem.id;
    delete plainItem.type;
    delete plainItem.createdAt;
    delete plainItem.updatedAt;
    delete plainItem.version;

    validateRecursively(plainItem, validators);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

// ===============================================================================
// ===============================================================================
// ===============================================================================
// ===============================================================================
// ===============================================================================


// Uso del sistema
const userId: string = crypto.randomUUID();

const product = CatalogItemFactory.createProduct({
  name: 'Laptop',
  price: 999,
  category: 'Electronics',
  inStock: true,
  metadata: {
    weight: 2.5,
    dimensions: { width: 30, height: 20, depth: 2 },
    tags: ['laptop', 'computer', 'portable']
  }
});

const productValidationResult = validateCatalogItem(product);
console.log('Validation result: ', productValidationResult.valid);
console.log('Validation errors: ', productValidationResult.errors);

const apiResponse = CatalogProcessor.processItem(product);
const processorEvent = CatalogProcessor.createEvent(product, { price: 899 }, userId)

console.log('API Response:', apiResponse);
console.log('Event:', processorEvent);

// ===============================================================================

const service = CatalogItemFactory.createService({
  name: 'Web development',
  hourlyRate: 75,
  category: 'Software',
  available: true,
  metadata: {
    duration: -40, // Should be an erro
    requirements: ['Laptop', 'Internet communication'],
    location: 'remote',
  },
});

const serviceValidationResult = validateCatalogItem(service);
console.log('Validation result: ', serviceValidationResult.valid);
console.log('Validation errors: ', serviceValidationResult.errors);

const serviceApiResponse = CatalogProcessor.processItem(service);
const serviceEvent = CatalogProcessor.createEvent(service, { hourlyRate: 150 }, userId);

console.log('Service API Response:', serviceApiResponse);
console.log('Service Event:', serviceEvent);

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
const { compilerOptions } = require('./tsconfig.json');
const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('jest').Config} */
const config = {
  // Configuración base
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  
  // Path mapping para imports
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Timeout para tests
  testTimeout: 30000,
  
  // **CONFIGURACIÓN MULTICAPA - Pirámide de Testing**
  projects: [
    {
      displayName: 'unit',
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      collectCoverageFrom: [
        'apps/**/*.ts',
        '!apps/**/*.d.ts',
        '!apps/**/main.ts',
        '!apps/**/*.module.ts'
      ],
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    {
      displayName: 'integration',
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      collectCoverageFrom: [
        'apps/**/*.service.ts',
        'apps/**/*.controller.ts'
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    {
      displayName: 'contract',
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ['<rootDir>/tests/contract/**/*.spec.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      // Sin coverage para tests de contrato
      collectCoverage: false,
      testTimeout: 60000 // Mayor timeout para Pact
    }
  ],
  
  // Configuración de coverage general
  collectCoverageFrom: [
    "apps/**/*.ts",
    "!apps/**/*.d.ts",
    "!apps/**/main.ts"
  ],
  
  // Coverage reporters
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "html"
  ]
};

module.exports = config;

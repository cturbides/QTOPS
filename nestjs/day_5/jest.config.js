const ts = require("typescript");
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@test/(.*)$": '<rootDir>/test/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@orders/(.*)$': '<rootDir>/src/orders/$1',
    '^@products/(.*)$': '<rootDir>/src/products/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@data-source/(.*)$': '<rootDir>/src/data-source/$1',
  },
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "branches": 80,
      "functions": 80,
    }
  }
};

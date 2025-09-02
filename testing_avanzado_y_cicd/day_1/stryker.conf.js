/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
module.exports = {
  mutate: [
    'apps/curso-completo-ms/src/modules/curso-completo/services/curso-completo.service.ts'
  ],
  
  testRunner: 'jest',
  checkers: ['typescript'],
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: false
  },
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  
  mutator: {
    excludedMutations: [
      'StringLiteral',  // Evitar mutar strings literales que son constantes
      'ArrayDeclaration' // Evitar mutar declaraciones de arrays vacíos
    ]
  },
  
  tsconfigFile: 'tsconfig.json',
  reporters: [
    'html',
    'clear-text',
    'progress'
  ],
  
  htmlReporter: {
    fileName: 'reports/mutation/index.html'
  },
  
  timeoutMS: 20000,
  
  logLevel: 'info',
  
  concurrency: 2,
  
  disableTypeChecks: true,
  
  testRunnerNodeArgs: ['--max-old-space-size=4096']
};

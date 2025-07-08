module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/__tests__/**',
    '!backend/src/types/**',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  // Add this to help Jest detect open handles
  detectOpenHandles: true,
  // Add this to force Jest to exit after tests complete
  forceExit: true
};

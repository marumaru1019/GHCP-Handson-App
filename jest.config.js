/**
 * Jest 設定ファイル（next/jest + SWC対応）
 * @type {import('jest').Config}
 */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

module.exports = createJestConfig(customJestConfig);

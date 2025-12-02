/**
 * Jest 設定ファイル（next/jest + SWC対応）
 * @type {import('jest').Config}
 */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js アプリのパスを指定し、next.config.js と .env ファイルをテスト環境で読み込む
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

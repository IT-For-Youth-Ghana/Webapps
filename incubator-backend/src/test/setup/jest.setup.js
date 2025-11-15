/* eslint-disable no-undef */
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testTimeout: 10000, // Increase timeout for DB operations
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
};

import { connectDB, disconnectDB } from './setupTestDB';

// Connect once before all tests
beforeAll(async () => {
  await connectDB();
});

// Disconnect once after all tests
afterAll(async () => {
  await disconnectDB();
});
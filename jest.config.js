export default {
  testEnvironment: 'node',
  // Transform files to handle mixed module types
  transform: {},
  testMatch: ['**/__tests__/**/*.js'],
  // Allow Jest to handle CommonJS requires even in ESM projects
  extensionsToTreatAsEsm: [],
  setupFilesAfterEnv: []
};

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        isolatedModules: true
      }],
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
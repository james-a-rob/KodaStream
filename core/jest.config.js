/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",

  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/events/']

};



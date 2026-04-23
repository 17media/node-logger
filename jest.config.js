export default {
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "<rootDir>/lib/",
    "<rootDir>/node_modules/"
  ],
  setupFilesAfterEnv: ['<rootDir>/testing/setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};

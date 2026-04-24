export default {
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "<rootDir>/lib/",
    "<rootDir>/node_modules/",
    "<rootDir>/testing/"
  ],
  setupFilesAfterEnv: ['<rootDir>/testing/setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "<rootDir>/lib/",
    "<rootDir>/node_modules/"
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};

module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "<rootDir>/lib/",
    "<rootDir>/node_modules/"
  ],
  setupFilesAfterEnv: ['<rootDir>/testing/setup.js'],
};
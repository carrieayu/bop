/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/__mocks__/styleMock.js",
    "^.+\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/node_modules/jest-transform-stub",
  }
};

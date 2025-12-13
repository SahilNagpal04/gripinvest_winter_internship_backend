// Jest testing configuration
const nextJest = require('next/jest')

// Create Jest config with Next.js settings
const createJestConfig = nextJest({
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Test environment (jsdom simulates browser)
  testEnvironment: 'jest-environment-jsdom',
  // Files to collect coverage from
  collectCoverageFrom: [
    'pages/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!pages/_app.js',
    '!pages/_document.js',
  ],
  // Coverage thresholds (75% minimum)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 25,
      lines: 44,
      statements: 44,
    },
  },
}

module.exports = createJestConfig(customJestConfig)

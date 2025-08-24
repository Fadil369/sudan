module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module name mapping for CSS modules and assets
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ],
        plugins: [
          '@babel/plugin-proposal-private-property-in-object'
        ]
      }
    ]
  },
  
  // Files to ignore during transformation
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@mui|@babel/runtime))'
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/src/tests/**/*.(js|jsx|ts|tsx)'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(js|jsx|ts|tsx)',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/setupTests.js',
    '!src/__mocks__/**',
    '!src/**/*.stories.(js|jsx|ts|tsx)'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/tests/globalSetup.js',
  globalTeardown: '<rootDir>/src/tests/globalTeardown.js',
  
  // Custom test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    userAgent: 'node.js'
  },
  
  // Watch mode configuration
  watchPathIgnorePatterns: ['node_modules', 'coverage', 'dist', 'build'],
  
  // Snapshot serializers
  snapshotSerializers: ['@emotion/jest/serializer'],
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/test-results',
        filename: 'report.html',
        expand: true
      }
    ]
  ]
};
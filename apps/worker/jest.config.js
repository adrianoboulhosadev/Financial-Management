/**
 * Tests the pure parts of the worker: how a posted recurrence and a budget
 * crossing are turned into notifications. The context packages and shared
 * resolve directly from source (no prior build).
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@transaction/adapters$': '<rootDir>/../../packages/transaction/adapters/src/index.ts',
    '^@transaction/core$': '<rootDir>/../../packages/transaction/core/src/index.ts',
    '^@budget/adapters$': '<rootDir>/../../packages/budget/adapters/src/index.ts',
    '^@budget/core$': '<rootDir>/../../packages/budget/core/src/index.ts',
    '^@notification/adapters$': '<rootDir>/../../packages/notification/adapters/src/index.ts',
    '^@notification/core$': '<rootDir>/../../packages/notification/core/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {}],
  },
}

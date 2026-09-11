import { MonthPeriod, ValidationError, Errors } from '../../src'

test('parses a YYYY-MM value into year and 1-based month', () => {
  const period = new MonthPeriod('2026-08')
  expect(period.year).toBe(2026)
  expect(period.month).toBe(8)
  expect(period.toString()).toBe('2026-08')
})

test('rejects anything that is not a real YYYY-MM month', () => {
  expect(() => new MonthPeriod('2026-13')).toThrow(ValidationError)
  expect(() => new MonthPeriod('2026-00')).toThrow(ValidationError)
  expect(() => new MonthPeriod('08-2026')).toThrow(ValidationError)
  expect(() => new MonthPeriod('')).toThrow(ValidationError)
  expect(() => new MonthPeriod(undefined)).toThrow(ValidationError)
})

test('the rejection carries the INVALID_PERIOD code', () => {
  try {
    new MonthPeriod('nope')
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_PERIOD)
  }
})

test('of() resolves the month an instant falls into, in UTC', () => {
  expect(MonthPeriod.of(new Date('2026-08-16T12:00:00Z')).value).toBe('2026-08')
  // Last instant of the month: still that month, never the next one.
  expect(MonthPeriod.of(new Date('2026-08-31T23:59:59Z')).value).toBe('2026-08')
})

test('the window is [start, end) with an exclusive upper bound', () => {
  const period = new MonthPeriod('2026-02')
  expect(period.start.toISOString()).toBe('2026-02-01T00:00:00.000Z')
  // The exclusive end is the FIRST instant of March, so the whole 28th counts.
  expect(period.end.toISOString()).toBe('2026-03-01T00:00:00.000Z')
})

test('knows how many days the month has, leap year included', () => {
  expect(new MonthPeriod('2026-02').daysInMonth).toBe(28)
  expect(new MonthPeriod('2024-02').daysInMonth).toBe(29)
  expect(new MonthPeriod('2026-04').daysInMonth).toBe(30)
  expect(new MonthPeriod('2026-01').daysInMonth).toBe(31)
})

test('dayAt clamps to the last day instead of rolling into the next month', () => {
  expect(new MonthPeriod('2026-02').dayAt(31).toISOString()).toBe('2026-02-28T00:00:00.000Z')
  expect(new MonthPeriod('2024-02').dayAt(31).toISOString()).toBe('2024-02-29T00:00:00.000Z')
  expect(new MonthPeriod('2026-08').dayAt(10).toISOString()).toBe('2026-08-10T00:00:00.000Z')
  // Below the floor is clamped too — the entity validates the range, this is the safety net.
  expect(new MonthPeriod('2026-08').dayAt(0).toISOString()).toBe('2026-08-01T00:00:00.000Z')
})

test('previous/next walk across the year boundary', () => {
  expect(new MonthPeriod('2026-01').previous().value).toBe('2025-12')
  expect(new MonthPeriod('2026-12').next().value).toBe('2027-01')
})

test('equals compares the month itself', () => {
  expect(new MonthPeriod('2026-08').equals(new MonthPeriod('2026-08'))).toBe(true)
  expect(new MonthPeriod('2026-08').equals(new MonthPeriod('2026-09')).valueOf()).toBe(false)
  expect(new MonthPeriod('2026-08').equals(undefined)).toBe(false)
})

test('orders months lexicographically, which is also chronologically', () => {
  expect(new MonthPeriod('2025-09').isBefore(new MonthPeriod('2025-10'))).toBe(true)
  // The year boundary is the case a naive numeric comparison gets wrong.
  expect(new MonthPeriod('2025-12').isBefore(new MonthPeriod('2026-01'))).toBe(true)
  expect(new MonthPeriod('2026-01').isAfter(new MonthPeriod('2025-12'))).toBe(true)
  // A month is neither before nor after itself.
  expect(new MonthPeriod('2026-09').isBefore(new MonthPeriod('2026-09'))).toBe(false)
  expect(new MonthPeriod('2026-09').isAfter(new MonthPeriod('2026-09'))).toBe(false)
})

test('readableBy accepts the month the account was created in, and later ones', () => {
  const createdAt = new Date('2026-09-11T10:00:00.000Z')

  expect(MonthPeriod.readableBy('2026-09', createdAt).value).toBe('2026-09')
  expect(MonthPeriod.readableBy('2026-11', createdAt).value).toBe('2026-11')
})

test('readableBy refuses a month earlier than the account', () => {
  const createdAt = new Date('2026-09-11T10:00:00.000Z')

  expect(() => MonthPeriod.readableBy('2026-08', createdAt)).toThrow(ValidationError)
  // Crossing back over a year boundary is the same refusal.
  expect(() => MonthPeriod.readableBy('2025-12', createdAt)).toThrow(ValidationError)
})

test('the refusal carries the PERIOD_BEFORE_ACCOUNT_START code', () => {
  try {
    MonthPeriod.readableBy('2020-01', new Date('2026-09-11T10:00:00.000Z'))
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.PERIOD_BEFORE_ACCOUNT_START)
  }
})

test('readableBy defaults to the current month when none is given', () => {
  // An account created long ago: whatever "now" is, the default is readable.
  const period = MonthPeriod.readableBy(undefined, new Date('2020-01-05T00:00:00.000Z'))
  expect(period.value).toBe(MonthPeriod.of().value)
})

test('readableBy compares by MONTH, not by day — the account start is readable from its 1st', () => {
  // Created on the 11th; the 1st..10th of that same month are still "the month
  // the account exists in", and the month's own figures include them.
  const createdAt = new Date('2026-09-11T10:00:00.000Z')
  expect(MonthPeriod.readableBy('2026-09', createdAt).value).toBe('2026-09')
})

test('readableBy still enforces the format', () => {
  expect(() => MonthPeriod.readableBy('2026-13', new Date('2020-01-01T00:00:00.000Z'))).toThrow(
    ValidationError,
  )
})

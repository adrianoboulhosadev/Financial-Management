import { ValidationError, Errors, MonthPeriod } from 'shared'
import {
  Bank,
  Card,
  CardDTO,
  CreateBank,
  InvoiceSchedule,
  InvoiceCalculator,
  CreateCard,
  UpdateCard,
  ListMyCardInvoicesQuery,
  ListMyPayableInvoicesQuery,
  SetInvoicePaid,
} from '../src'
import { BankRepositoryInMemory, CardInvoicePaymentRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const creditCard = { ownerId: owner, bankId: 'b1', brand: 'visa', kind: 'credit' as const, lastFourDigits: '1234' }
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

test('an invoice calendar needs BOTH days, inside 1-31', () => {
  expect(() => new InvoiceSchedule({ closingDay: 0, dueDay: 10 })).toThrow(ValidationError)
  expect(() => new InvoiceSchedule({ closingDay: 32, dueDay: 10 })).toThrow(ValidationError)
  expect(() => new InvoiceSchedule({ closingDay: 11.5, dueDay: 10 })).toThrow(ValidationError)

  // Half a calendar is not a calendar: one day without the other is refused,
  // and neither day at all is simply "no invoice".
  expect(() => InvoiceSchedule.optional({ closingDay: 11 })).toThrow(ValidationError)
  expect(InvoiceSchedule.optional({})).toBeNull()

  try {
    new InvoiceSchedule({ closingDay: 40, dueDay: 10 })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_INVOICE_DAY)
  }
})

test('a purchase falls on the invoice that has not closed yet', () => {
  const schedule = new InvoiceSchedule({ closingDay: 11, dueDay: 18 })

  // Bought before closing: this month's invoice.
  expect(schedule.periodOf(day('2026-09-03')).value).toBe('2026-09')
  // Bought ON closing day: still this month's — the invoice closes at the end
  // of that day, not at its start.
  expect(schedule.periodOf(day('2026-09-11')).value).toBe('2026-09')
  // Bought after it closed: already the next one.
  expect(schedule.periodOf(day('2026-09-12')).value).toBe('2026-10')
  // December rolls the YEAR, not just the month.
  expect(schedule.periodOf(day('2026-12-20')).value).toBe('2027-01')
})

test('a card that closes on the 31st still closes in February', () => {
  const schedule = new InvoiceSchedule({ closingDay: 31, dueDay: 10 })

  // February has no 31st, so the invoice closes on the 28th — and a purchase
  // made on the 28th is inside it, not pushed into March by a day that does
  // not exist.
  expect(schedule.closesOn(new MonthPeriod('2026-02'))).toEqual(day('2026-02-28'))
  expect(schedule.periodOf(day('2026-02-28')).value).toBe('2026-02')
})

test('the due date lands in the next month when it does not come after closing', () => {
  const september = new MonthPeriod('2026-09')

  // Closes on the 11th, due on the 18th: same month.
  expect(new InvoiceSchedule({ closingDay: 11, dueDay: 18 }).dueOn(september)).toEqual(
    day('2026-09-18'),
  )
  // Closes on the 25th, due on the 5th: the 5th of the month after.
  expect(new InvoiceSchedule({ closingDay: 25, dueDay: 5 }).dueOn(september)).toEqual(
    day('2026-10-05'),
  )
  // Closing and paying the same day is not a thing — an invoice that closed
  // today is never payable today, so it rolls over too.
  expect(new InvoiceSchedule({ closingDay: 10, dueDay: 10 }).dueOn(september)).toEqual(
    day('2026-10-10'),
  )
})

test('only a credit card carries a calendar and a limit', () => {
  const debit = { ...creditCard, kind: 'debit' }

  expect(() => new Card({ ...debit, closingDay: 11, dueDay: 18 })).toThrow(ValidationError)
  expect(() => new Card({ ...debit, limitCents: 500000 })).toThrow(ValidationError)
  try {
    new Card({ ...debit, limitCents: 500000 })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.CARD_NOT_CREDIT)
  }

  // A zero limit is not "a limit of nothing" — it is a card that cannot be
  // used, which is not what anybody means by filling the field in.
  expect(() => new Card({ ...creditCard, limitCents: 0 })).toThrow(ValidationError)

  const card = new Card({ ...creditCard, kind: 'both', closingDay: 11, dueDay: 18, limitCents: 500000 })
  expect(card.hasInvoice).toBe(true)
  expect(card.limit?.cents).toBe(500000)
})

test('a card registered before invoices existed is still readable', () => {
  // Every column is nullable, so the rows already stored reconstitute exactly
  // as they are — including a debit card, which never had any of them.
  const card = new Card({ ...creditCard, closingDay: null, dueDay: null, limitCents: null })
  expect(card.hasInvoice).toBe(false)
  expect(card.limit).toBeNull()
})

test('editing the calendar validates before it assigns', () => {
  const card = new Card({ ...creditCard, closingDay: 11, dueDay: 18, limitCents: 500000 })

  // Turning it debit-only while it still carries credit details is refused,
  // and the card is left EXACTLY as it was — not half applied.
  expect(() => card.edit({ kind: 'debit' })).toThrow(ValidationError)
  expect(card.kind).toBe('credit')
  expect(card.schedule?.closingDay).toBe(11)

  // Clearing them in the same edit is how a card becomes debit-only.
  card.edit({ kind: 'debit', closingDay: null, dueDay: null, limitCents: null })
  expect(card.kind).toBe('debit')
  expect(card.hasInvoice).toBe(false)
  expect(card.limit).toBeNull()
})

test('one day can be edited without resending the other', () => {
  const card = new Card({ ...creditCard, closingDay: 11, dueDay: 18 })

  card.edit({ closingDay: 20 })
  expect(card.schedule?.closingDay).toBe(20)
  expect(card.schedule?.dueDay).toBe(18)
})

const cardOf = (fields: Partial<CardDTO> = {}): CardDTO => ({
  id: 'c1',
  ownerId: owner,
  bankId: 'b1',
  brand: 'visa',
  kind: 'credit',
  lastFourDigits: '1234',
  closingDay: 11,
  dueDay: 18,
  limitCents: null,
  ...fields,
})

test('a card with no calendar has no invoice to show', () => {
  expect(
    InvoiceCalculator.calculate(cardOf({ closingDay: null, dueDay: null }), [], day('2026-09-15')),
  ).toBeNull()
})

test('the open invoice collects what was bought after the last closing', () => {
  const invoices = InvoiceCalculator.calculate(
    cardOf(),
    [
      // Bought on the 5th, so it sits on the invoice that closed on the 11th —
      // history the product cannot settle, and counting it would inflate the
      // open one.
      { occurredOn: day('2026-09-05'), amountCents: 9900 },
      { occurredOn: day('2026-09-14'), amountCents: 5000 },
      { occurredOn: day('2026-10-02'), amountCents: 2500 },
    ],
    // Today is the 20th, so the invoice taking charges is October's.
    day('2026-09-20'),
  )!

  expect(invoices.invoices).toHaveLength(1)
  const [open] = invoices.invoices
  expect(open.period).toBe('2026-10')
  expect(open.open).toBe(true)
  expect(open.amountCents).toBe(7500)
  expect(open.closesOn).toEqual(day('2026-10-11'))
  expect(open.dueOn).toEqual(day('2026-10-18'))
  expect(invoices.usedCents).toBe(7500)
})

test('an instalment due months ahead already holds the limit down', () => {
  const invoices = InvoiceCalculator.calculate(
    cardOf({ limitCents: 100000 }),
    [
      { occurredOn: day('2026-09-03'), amountCents: 20000 },
      { occurredOn: day('2026-10-03'), amountCents: 20000 },
      { occurredOn: day('2026-11-03'), amountCents: 20000 },
    ],
    day('2026-09-05'),
  )!

  // Three invoices, open first and then the ones still ahead.
  expect(invoices.invoices.map((invoice) => invoice.period)).toEqual([
    '2026-09',
    '2026-10',
    '2026-11',
  ])
  expect(invoices.invoices[0].open).toBe(true)
  expect(invoices.invoices[1].open).toBe(false)

  // The whole plan is spent money, even though only a third of it was billed:
  // counting just the open invoice would offer the other 400 to be spent again.
  expect(invoices.usedCents).toBe(60000)
  expect(invoices.availableCents).toBe(40000)
  expect(invoices.usagePercentage).toBe(60)
  expect(invoices.limitStatus).toBe('ok')
})

test('an invoice with nothing on it is still an invoice', () => {
  const invoices = InvoiceCalculator.calculate(cardOf(), [], day('2026-09-05'))!

  // A card nobody used this month reads "R$ 0,00, fecha dia 11" — the dates are
  // the answer, and an empty list would look like the calendar was missing.
  expect(invoices.invoices).toHaveLength(1)
  expect(invoices.invoices[0].amountCents).toBe(0)
  expect(invoices.availableCents).toBeNull()
  expect(invoices.usagePercentage).toBeNull()
  expect(invoices.limitStatus).toBeNull()
})

test('going over the limit reports how far past it went', () => {
  const invoices = InvoiceCalculator.calculate(
    cardOf({ limitCents: 50000 }),
    [{ occurredOn: day('2026-09-03'), amountCents: 70000 }],
    day('2026-09-05'),
  )!

  expect(invoices.availableCents).toBe(-20000)
  expect(invoices.usagePercentage).toBe(140)
  expect(invoices.limitStatus).toBe('exceeded')
})

test('the limit turns to warning at 80% and to exceeded at exactly 100%', () => {
  const at = (amountCents: number) =>
    InvoiceCalculator.calculate(
      cardOf({ limitCents: 100000 }),
      [{ occurredOn: day('2026-09-03'), amountCents }],
      day('2026-09-05'),
    )!.limitStatus

  expect(at(79999)).toBe('ok')
  expect(at(80000)).toBe('warning')
  // Spending the limit to the cent is spending it, not nearly spending it.
  expect(at(100000)).toBe('exceeded')
})

test('the invoice listing skips cards with no calendar and never sees another owner', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })
  const bankId = banks.banks[0].id

  await new CreateCard(cards, banks).execute({
    ...creditCard,
    bankId,
    closingDay: 11,
    dueDay: 18,
    limitCents: 100000,
  })
  await new CreateCard(cards, banks).execute({
    ownerId: owner,
    bankId,
    brand: 'elo',
    kind: 'debit',
    lastFourDigits: '5678',
  })

  const [credit] = cards.cards
  const invoices = await new ListMyCardInvoicesQuery(cards).execute({
    ownerId: owner,
    charges: [{ cardId: credit.id, occurredOn: day('2026-09-03'), amountCents: 12300 }],
    reference: day('2026-09-05'),
  })

  // The debit card is LEFT OUT rather than returned empty: it has no invoice,
  // and a row reading "R$ 0,00" would claim it does.
  expect(invoices).toHaveLength(1)
  expect(invoices[0].cardId).toBe(credit.id)
  expect(invoices[0].invoices[0].amountCents).toBe(12300)

  expect(
    await new ListMyCardInvoicesQuery(cards).execute({ ownerId: 'user-2', charges: [] }),
  ).toEqual([])
})

test('a card can be given its calendar after the fact', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })

  await new CreateCard(cards, banks).execute({ ...creditCard, bankId: banks.banks[0].id })
  const cardId = cards.cards[0].id
  expect(cards.cards[0].closingDay).toBeNull()

  await new UpdateCard(cards).execute({ ownerId: owner, cardId, closingDay: 11, dueDay: 18 })
  expect(cards.cards[0].closingDay).toBe(11)
  expect(cards.cards[0].dueDay).toBe(18)
})

test('the month pays the invoice that falls due in it, not the one that closes in it', () => {
  const october = new MonthPeriod('2026-10')

  // Closes on the 11th, due on the 18th: October pays October's own invoice.
  expect(new InvoiceSchedule({ closingDay: 11, dueDay: 18 }).closingPeriodDueIn(october).value).toBe(
    '2026-10',
  )
  // Closes on the 25th, due on the 5th: October pays SEPTEMBER's invoice.
  expect(new InvoiceSchedule({ closingDay: 25, dueDay: 5 }).closingPeriodDueIn(october).value).toBe(
    '2026-09',
  )
})

test('the month lists the invoice it owes, with the real due date', () => {
  const payable = InvoiceCalculator.payableIn(
    cardOf(),
    new MonthPeriod('2026-10'),
    [
      // Inside the invoice that closes 11/10 (bought after 11/09).
      { occurredOn: day('2026-09-20'), amountCents: 12000 },
      { occurredOn: day('2026-10-03'), amountCents: 30000 },
      // Already on the NEXT invoice — bought after this one closed.
      { occurredOn: day('2026-10-15'), amountCents: 5000 },
      // Belongs to the invoice October already paid in September.
      { occurredOn: day('2026-09-02'), amountCents: 9900 },
    ],
    [],
    day('2026-10-14'),
  )!

  expect(payable.period).toBe('2026-10')
  expect(payable.amountCents).toBe(42000)
  expect(payable.dueOn).toEqual(day('2026-10-18'))
  expect(payable.closesOn).toEqual(day('2026-10-11'))
  // Today is the 14th, so it has closed: the figure is final, not provisional.
  expect(payable.closed).toBe(true)
  expect(payable.paid).toBe(false)
})

test('an invoice due this month is listed before it closes, and says so', () => {
  const payable = InvoiceCalculator.payableIn(
    cardOf(),
    new MonthPeriod('2026-10'),
    [{ occurredOn: day('2026-10-03'), amountCents: 30000 }],
    [],
    // The 5th: due on the 18th, but it only closes on the 11th.
    day('2026-10-05'),
  )!

  expect(payable.closed).toBe(false)
  expect(payable.amountCents).toBe(30000)
})

test('a card nobody used has no bill to tick off', () => {
  // Zero is not a line: asking the owner to tick off nothing is worse than
  // saying nothing at all.
  expect(
    InvoiceCalculator.payableIn(cardOf(), new MonthPeriod('2026-10'), [], [], day('2026-10-14')),
  ).toBeNull()
  // Neither does a card with no calendar.
  expect(
    InvoiceCalculator.payableIn(
      cardOf({ closingDay: null, dueDay: null }),
      new MonthPeriod('2026-10'),
      [{ occurredOn: day('2026-10-03'), amountCents: 30000 }],
      [],
      day('2026-10-14'),
    ),
  ).toBeNull()
})

test('a ticked invoice reads as paid', () => {
  const paidAt = day('2026-10-16')
  const payable = InvoiceCalculator.payableIn(
    cardOf(),
    new MonthPeriod('2026-10'),
    [{ occurredOn: day('2026-10-03'), amountCents: 30000 }],
    [{ cardId: 'c1', period: '2026-10', paidAt }],
    day('2026-10-20'),
  )!

  expect(payable.paid).toBe(true)
  expect(payable.paidAt).toEqual(paidAt)
})

test('ticking an invoice writes only the deviation, and un-ticking drops it', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  const payments = new CardInvoicePaymentRepositoryInMemory()
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })
  await new CreateCard(cards, banks).execute({
    ...creditCard,
    bankId: banks.banks[0].id,
    closingDay: 11,
    dueDay: 18,
  })
  const cardId = cards.cards[0].id
  const setPaid = new SetInvoicePaid(cards, payments)

  // Nothing is written until somebody says something: an untouched invoice
  // costs no row at all.
  expect(payments.payments).toHaveLength(0)

  await setPaid.execute({ ownerId: owner, cardId, period: '2026-10', paid: true })
  expect(payments.payments).toHaveLength(1)
  const { paidAt } = payments.payments[0]
  expect(paidAt).not.toBeNull()

  // Idempotente: ticking twice must not move the date it was paid on.
  await setPaid.execute({ ownerId: owner, cardId, period: '2026-10', paid: true })
  expect(payments.payments).toHaveLength(1)
  expect(payments.payments[0].paidAt).toEqual(paidAt)

  // Un-ticking leaves nothing to remember, so the row goes rather than
  // lingering as a record of nothing.
  await setPaid.execute({ ownerId: owner, cardId, period: '2026-10', paid: false })
  expect(payments.payments).toHaveLength(0)
})

test('ticking off somebody else’s invoice answers as missing', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  const payments = new CardInvoicePaymentRepositoryInMemory()
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })
  await new CreateCard(cards, banks).execute({
    ...creditCard,
    bankId: banks.banks[0].id,
    closingDay: 11,
    dueDay: 18,
  })
  const cardId = cards.cards[0].id

  await expect(
    new SetInvoicePaid(cards, payments).execute({
      ownerId: 'user-2',
      cardId,
      period: '2026-10',
      paid: true,
    }),
  ).rejects.toMatchObject({ code: Errors.CARD_NOT_FOUND })
  expect(payments.payments).toHaveLength(0)
})

test('a card with no calendar has no invoice to tick', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  const payments = new CardInvoicePaymentRepositoryInMemory()
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })
  await new CreateCard(cards, banks).execute({ ...creditCard, bankId: banks.banks[0].id })

  await expect(
    new SetInvoicePaid(cards, payments).execute({
      ownerId: owner,
      cardId: cards.cards[0].id,
      period: '2026-10',
      paid: true,
    }),
  ).rejects.toMatchObject({ code: Errors.CARD_HAS_NO_INVOICE })
})

test('the payable list is ordered by due date and skips what is not owed', async () => {
  const banks = new BankRepositoryInMemory()
  const cards = banks.cardRepository
  const payments = new CardInvoicePaymentRepositoryInMemory()
  await new CreateBank(banks).execute({ ownerId: owner, name: 'Itaú' })
  const bankId = banks.banks[0].id

  // Due on the 18th.
  await new CreateCard(cards, banks).execute({
    ...creditCard,
    bankId,
    closingDay: 11,
    dueDay: 18,
  })
  // Due on the 5th — of the month AFTER it closes, so October pays the one that
  // closed in September.
  await new CreateCard(cards, banks).execute({
    ownerId: owner,
    bankId,
    brand: 'elo',
    kind: 'credit',
    lastFourDigits: '5678',
    closingDay: 25,
    dueDay: 5,
  })
  // No calendar at all: never on the list.
  await new CreateCard(cards, banks).execute({
    ownerId: owner,
    bankId,
    brand: 'mastercard',
    kind: 'credit',
    lastFourDigits: '9012',
  })
  const [first, second] = cards.cards

  const payable = await new ListMyPayableInvoicesQuery(cards, payments).execute({
    ownerId: owner,
    period: '2026-10',
    charges: [
      { cardId: first.id, occurredOn: day('2026-10-03'), amountCents: 30000 },
      { cardId: second.id, occurredOn: day('2026-09-10'), amountCents: 20000 },
    ],
    reference: day('2026-10-14'),
  })

  // Ordered by when they fall due — the order they get paid in.
  expect(payable.map((invoice) => invoice.dueOn)).toEqual([day('2026-10-05'), day('2026-10-18')])
  expect(payable[0].cardId).toBe(second.id)
  expect(payable[0].period).toBe('2026-09')
  expect(payable[1].period).toBe('2026-10')

  // Another owner sees nothing of it.
  expect(
    await new ListMyPayableInvoicesQuery(cards, payments).execute({
      ownerId: 'user-2',
      period: '2026-10',
      charges: [{ cardId: first.id, occurredOn: day('2026-10-03'), amountCents: 30000 }],
    }),
  ).toEqual([])
})

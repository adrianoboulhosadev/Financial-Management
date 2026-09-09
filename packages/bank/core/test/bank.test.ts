import { ValidationError, ConflictError, NotFoundError, Errors } from 'shared'
import {
  Bank,
  Card,
  CreateBank,
  UpdateBank,
  DeleteBank,
  ListMyBanksQuery,
  FindMyBankQuery,
  CreateCard,
  UpdateCard,
  DeleteCard,
  ListMyCardsQuery,
} from '../src'
import { BankRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const itau = { ownerId: owner, name: 'Itaú' }

test('a bank needs a name; agency and account are optional', () => {
  expect(() => new Bank({ ...itau, name: '  ' })).toThrow(ValidationError)

  const bank = new Bank({ ...itau, agency: '  ', accountNumber: ' 12345-6 ' })
  // Blank and absent mean the same thing, and only one of them is worth
  // storing.
  expect(bank.agency).toBeNull()
  expect(bank.accountNumber).toBe('12345-6')
})

test('a card holds only the last four digits, and always a bank', () => {
  const card = { ownerId: owner, bankId: 'b1', brand: 'visa', kind: 'credit' }

  expect(() => new Card({ ...card, lastFourDigits: '1234567890123456' })).toThrow(ValidationError)
  expect(() => new Card({ ...card, lastFourDigits: '12a4' })).toThrow(ValidationError)
  expect(() => new Card({ ...card, lastFourDigits: '123' })).toThrow(ValidationError)
  expect(() => new Card({ ...card, bankId: '', lastFourDigits: '1234' })).toThrow(ValidationError)
  try {
    new Card({ ...card, lastFourDigits: '99999' })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_CARD_LAST_DIGITS)
  }

  expect(new Card({ ...card, lastFourDigits: '1234' }).lastFourDigits).toBe('1234')
})

test('what a card can pay with, and its brand, are closed lists', () => {
  const card = { ownerId: owner, bankId: 'b1', brand: 'visa', lastFourDigits: '1234' }

  expect(() => new Card({ ...card, kind: 'voucher' })).toThrow(ValidationError)
  expect(new Card({ ...card, kind: 'both' }).allowsCredit).toBe(true)
  expect(new Card({ ...card, kind: 'both' }).allowsDebit).toBe(true)
  expect(new Card({ ...card, kind: 'debit' }).allowsCredit).toBe(false)

  // A brand nobody listed is `other`, never free text — the brand is what
  // identifies the card on screen.
  expect(() => new Card({ ...card, kind: 'credit', brand: 'Visa Infinite' })).toThrow(
    ValidationError,
  )
  try {
    new Card({ ...card, kind: 'credit', brand: 'nubank' })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_CARD_BRAND)
  }
})

test('a rejected edit leaves the bank untouched', () => {
  const bank = new Bank({ ...itau, agency: '0001' })
  expect(() => bank.edit({ name: '   ' })).toThrow(ValidationError)
  expect(bank.name).toBe('Itaú')
  expect(bank.agency).toBe('0001')
})

test('the same owner cannot keep two banks with one name', async () => {
  const repository = new BankRepositoryInMemory()
  const create = new CreateBank(repository)
  await create.execute(itau)

  await expect(create.execute(itau)).rejects.toBeInstanceOf(ConflictError)
  await expect(create.execute(itau)).rejects.toMatchObject({ code: Errors.BANK_ALREADY_EXISTS })
  // Another owner banking at the same place is nobody's business but theirs.
  await create.execute({ ...itau, ownerId: stranger })
  expect(repository.banks).toHaveLength(2)
})

test('a bank still holding cards is not deletable', async () => {
  const repository = new BankRepositoryInMemory()
  await new CreateBank(repository).execute(itau)
  const bankId = repository.banks[0].id
  await new CreateCard(repository.cardRepository, repository).execute({
    ownerId: owner,
    bankId,
    brand: 'visa',
    kind: 'both',
    lastFourDigits: '1234',
  })

  const remove = new DeleteBank(repository).execute({ ownerId: owner, bankId, inUse: false })
  await expect(remove).rejects.toBeInstanceOf(ConflictError)
  await expect(remove).rejects.toMatchObject({ code: Errors.BANK_IN_USE })

  // Nor is one that money already points at — the app layer answers that part.
  await new DeleteCard(repository.cardRepository).execute({
    ownerId: owner,
    cardId: repository.cardRepository.cards[0].id,
    inUse: false,
  })
  await expect(
    new DeleteBank(repository).execute({ ownerId: owner, bankId, inUse: true }),
  ).rejects.toMatchObject({ code: Errors.BANK_IN_USE })

  await new DeleteBank(repository).execute({ ownerId: owner, bankId, inUse: false })
  expect(repository.banks).toHaveLength(0)
})

test('a card can only hang from a bank of the same owner', async () => {
  const repository = new BankRepositoryInMemory()
  await new CreateBank(repository).execute({ ...itau, ownerId: stranger })
  const foreign = repository.banks[0].id

  const create = new CreateCard(repository.cardRepository, repository).execute({
    ownerId: owner,
    bankId: foreign,
    brand: 'visa',
    kind: 'credit',
    lastFourDigits: '1234',
  })
  await expect(create).rejects.toBeInstanceOf(NotFoundError)
  await expect(create).rejects.toMatchObject({ code: Errors.BANK_NOT_FOUND })
  expect(repository.cardRepository.cards).toHaveLength(0)
})

test('the same digits may repeat across banks, never inside one', async () => {
  const repository = new BankRepositoryInMemory()
  const createBank = new CreateBank(repository)
  await createBank.execute(itau)
  await createBank.execute({ ownerId: owner, name: 'Nubank' })
  const [first, second] = repository.banks
  const createCard = new CreateCard(repository.cardRepository, repository)
  const card = { ownerId: owner, brand: 'visa', kind: 'credit', lastFourDigits: '1234' }

  await createCard.execute({ ...card, bankId: first.id })
  await createCard.execute({ ...card, bankId: second.id })
  expect(repository.cardRepository.cards).toHaveLength(2)

  // Registering the same card twice is the only clash there is to prevent.
  await expect(createCard.execute({ ...card, bankId: first.id })).rejects.toMatchObject({
    code: Errors.CARD_ALREADY_EXISTS,
  })
})

test("someone else's bank and card answer as missing (anti-IDOR)", async () => {
  const repository = new BankRepositoryInMemory()
  await new CreateBank(repository).execute({ ...itau, ownerId: stranger })
  const foreignBank = repository.banks[0].id
  await new CreateCard(repository.cardRepository, repository).execute({
    ownerId: stranger,
    bankId: foreignBank,
    brand: 'visa',
    kind: 'credit',
    lastFourDigits: '1234',
  })
  const foreignCard = repository.cardRepository.cards[0].id

  await expect(
    new UpdateBank(repository).execute({ ownerId: owner, bankId: foreignBank, name: 'Meu' }),
  ).rejects.toMatchObject({ code: Errors.BANK_NOT_FOUND })
  await expect(
    new FindMyBankQuery(repository).execute({ ownerId: owner, bankId: foreignBank }),
  ).rejects.toMatchObject({ code: Errors.BANK_NOT_FOUND })
  await expect(
    new UpdateCard(repository.cardRepository).execute({
      ownerId: owner,
      cardId: foreignCard,
      brand: 'elo',
    }),
  ).rejects.toMatchObject({ code: Errors.CARD_NOT_FOUND })

  // And neither shows up in a listing that is not theirs.
  expect(await new ListMyBanksQuery(repository).execute(owner)).toHaveLength(0)
  expect(await new ListMyCardsQuery(repository.cardRepository).execute(owner)).toHaveLength(0)
})

test('renaming to its own current name is not a clash with itself', async () => {
  const repository = new BankRepositoryInMemory()
  await new CreateBank(repository).execute(itau)
  const bankId = repository.banks[0].id

  await new UpdateBank(repository).execute({ ownerId: owner, bankId, name: 'Itaú', agency: '0001' })
  expect(repository.banks[0].agency).toBe('0001')
})

test('the listing says how many cards a bank still holds', async () => {
  const repository = new BankRepositoryInMemory()
  await new CreateBank(repository).execute(itau)
  const bankId = repository.banks[0].id
  const createCard = new CreateCard(repository.cardRepository, repository)
  await createCard.execute({ ownerId: owner, bankId, brand: 'visa', kind: 'credit', lastFourDigits: '1234' })
  await createCard.execute({ ownerId: owner, bankId, brand: 'elo', kind: 'debit', lastFourDigits: '5678' })

  const [bank] = await new ListMyBanksQuery(repository).execute(owner)
  expect(bank.cardCount).toBe(2)
})

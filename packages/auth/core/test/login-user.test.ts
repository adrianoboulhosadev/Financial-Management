import { Errors } from 'shared'
import { RegisterUser, LoginUser } from '../src'
import {
  UserRepositoryInMemory,
  HashProviderInMemory,
  JwtProviderInMemory,
  AuthSessionRepositoryInMemory,
} from './in-memory'

/** Signing up is enough to get in: the platform is open, so there is no gate
 * between creating the account and logging into it. */
async function setupWithUser() {
  const repository = new UserRepositoryInMemory()
  const hash = new HashProviderInMemory()
  const jwt = new JwtProviderInMemory('secret')
  const sessionRepository = new AuthSessionRepositoryInMemory()

  await new RegisterUser(repository, hash).execute({ email: 'a@b.com', password: 'Senha@123' })
  const user = await repository.findByEmail('a@b.com')

  const login = new LoginUser(repository, hash, jwt, sessionRepository)
  return { repository, sessionRepository, login, userId: user!.id.value }
}

test('logs in, returns tokens and opens a refresh session', async () => {
  const { repository, sessionRepository, login } = await setupWithUser()
  const tokens = await login.execute({ email: 'A@b.com', password: 'Senha@123' })

  expect(tokens.accessToken.length).toBeGreaterThan(0)
  expect(tokens.refreshToken.length).toBeGreaterThan(0)

  const user = await repository.findByEmail('a@b.com')
  const sessions = await sessionRepository.findActiveByUser(user!.id.value)
  expect(sessions).toHaveLength(1)
})

test('wrong password and nonexistent email return the SAME generic error', async () => {
  const { login } = await setupWithUser()

  await expect(login.execute({ email: 'a@b.com', password: 'Wrong@123' })).rejects.toMatchObject({
    code: Errors.INVALID_EMAIL_OR_PASSWORD,
  })
  await expect(
    login.execute({ email: 'doesnotexist@b.com', password: 'Senha@123' }),
  ).rejects.toMatchObject({ code: Errors.INVALID_EMAIL_OR_PASSWORD })
})

test('a deactivated account is indistinguishable from a wrong password', async () => {
  const { repository, login, userId } = await setupWithUser()
  await repository.deactivate(userId)

  // Same code as a bad password on purpose: the answer never describes the
  // state of an account to whoever is knocking.
  await expect(login.execute({ email: 'a@b.com', password: 'Senha@123' })).rejects.toMatchObject({
    code: Errors.INVALID_EMAIL_OR_PASSWORD,
  })
})

test('a deactivated account opens no session', async () => {
  const { repository, sessionRepository, login, userId } = await setupWithUser()
  await repository.deactivate(userId)

  await expect(login.execute({ email: 'a@b.com', password: 'Senha@123' })).rejects.toBeDefined()
  expect(await sessionRepository.findActiveByUser(userId)).toHaveLength(0)
})

test('updates lastLoginAt on successful login', async () => {
  const { repository, login } = await setupWithUser()
  await login.execute({ email: 'a@b.com', password: 'Senha@123' })
  const user = await repository.findByEmail('a@b.com')
  // lastLoginAt is infra: not on the entity, only on the read DTO.
  const dto = await repository.findByIdQuery(user!.id.value)
  expect(dto!.lastLoginAt).toBeInstanceOf(Date)
})

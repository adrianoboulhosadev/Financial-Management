import { UseCase, ConflictError, Errors } from 'shared'
import { IncomeSource } from '../model'
import { IncomeSourceRepository } from '../providers'

interface Input {
  ownerId: string
  name: string
  amount: number
  payday: number
}

/** Registers a recurring income (the salary, typically). Every rule about the
 * source itself lives in the entity; the only thing decided here is that one
 * owner does not end up with two sources sharing a name. */
export default class CreateIncomeSource implements UseCase<Input, void> {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute({ ownerId, name, amount, payday }: Input): Promise<void> {
    const source = new IncomeSource({ ownerId, name, amount, payday })

    if (await this.repository.existsByName(ownerId, source.name)) {
      ConflictError.throwError(Errors.INCOME_SOURCE_ALREADY_EXISTS, source.name)
    }

    await this.repository.create(source)
  }
}

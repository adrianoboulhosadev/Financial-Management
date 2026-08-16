import { UseCase } from 'shared'
import { IncomeSourceDTO } from '../model'
import { IncomeSourceQueryRepository } from '../providers'

/** Read side (CQRS): every source of the caller, active or not — the screen
 * that manages them needs to see the paused ones too. */
export default class ListMyIncomeSourcesQuery implements UseCase<string, IncomeSourceDTO[]> {
  constructor(private readonly queryRepository: IncomeSourceQueryRepository) {}

  async execute(ownerId: string): Promise<IncomeSourceDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}

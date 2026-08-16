import {
  IncomeSourceRepository,
  IncomeSourceQueryRepository,
  IncomeSourceDTO,
  MonthlyIncomeDTO,
} from '@income/core'
import {
  CreateIncomeSourceController,
  UpdateIncomeSourceController,
  SetIncomeSourceActiveController,
  DeleteIncomeSourceController,
  ListMyIncomeSourcesController,
  GetMyMonthlyIncomeController,
} from '../controllers'
import {
  CreateIncomeSourceInput,
  UpdateIncomeSourceInput,
  SetIncomeSourceActiveInput,
} from '../@types'

/**
 * Single entry point the backend (NestJS) calls. Optional ports in the
 * constructor; each method builds its controller. `ownerId` is always the
 * authenticated id resolved from the JWT.
 */
export default class IncomeFacade {
  constructor(
    private readonly repository?: IncomeSourceRepository,
    private readonly queryRepository?: IncomeSourceQueryRepository,
  ) {}

  async createIncomeSource(input: CreateIncomeSourceInput, ownerId: string): Promise<void> {
    await new CreateIncomeSourceController(this.repository!).execute(input, ownerId)
  }

  async updateIncomeSource(
    incomeSourceId: string,
    input: UpdateIncomeSourceInput,
    ownerId: string,
  ): Promise<void> {
    await new UpdateIncomeSourceController(this.repository!).execute(
      incomeSourceId,
      input,
      ownerId,
    )
  }

  async setIncomeSourceActive(
    incomeSourceId: string,
    input: SetIncomeSourceActiveInput,
    ownerId: string,
  ): Promise<void> {
    await new SetIncomeSourceActiveController(this.repository!).execute(
      incomeSourceId,
      input,
      ownerId,
    )
  }

  async deleteIncomeSource(incomeSourceId: string, ownerId: string): Promise<void> {
    await new DeleteIncomeSourceController(this.repository!).execute(incomeSourceId, ownerId)
  }

  async listMyIncomeSources(ownerId: string): Promise<IncomeSourceDTO[]> {
    return new ListMyIncomeSourcesController(this.queryRepository!).execute(ownerId)
  }

  async getMyMonthlyIncome(ownerId: string): Promise<MonthlyIncomeDTO> {
    return new GetMyMonthlyIncomeController(this.queryRepository!).execute(ownerId)
  }
}

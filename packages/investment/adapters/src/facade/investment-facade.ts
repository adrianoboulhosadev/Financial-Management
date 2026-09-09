import {
  InvestmentRepository,
  InvestmentQueryRepository,
  InvestmentDTO,
  PortfolioDTO,
} from '@investment/core'
import {
  CreateInvestmentController,
  UpdateInvestmentController,
  SetInvestmentActiveController,
  DeleteInvestmentController,
  ListMyInvestmentsController,
  GetMyPortfolioController,
} from '../controllers'
import {
  CreateInvestmentInput,
  UpdateInvestmentInput,
  SetInvestmentActiveInput,
} from '../@types'

/**
 * Single entry point the backend (NestJS) calls. Optional ports in the
 * constructor; each method builds its controller. `ownerId` is always the
 * authenticated id resolved from the JWT.
 */
export default class InvestmentFacade {
  constructor(
    private readonly repository?: InvestmentRepository,
    private readonly queryRepository?: InvestmentQueryRepository,
  ) {}

  async createInvestment(input: CreateInvestmentInput, ownerId: string): Promise<void> {
    await new CreateInvestmentController(this.repository!).execute(input, ownerId)
  }

  async updateInvestment(
    investmentId: string,
    input: UpdateInvestmentInput,
    ownerId: string,
  ): Promise<void> {
    await new UpdateInvestmentController(this.repository!).execute(investmentId, input, ownerId)
  }

  async setInvestmentActive(
    investmentId: string,
    input: SetInvestmentActiveInput,
    ownerId: string,
  ): Promise<void> {
    await new SetInvestmentActiveController(this.repository!).execute(investmentId, input, ownerId)
  }

  async deleteInvestment(investmentId: string, ownerId: string): Promise<void> {
    await new DeleteInvestmentController(this.repository!).execute(investmentId, ownerId)
  }

  async listMyInvestments(ownerId: string): Promise<InvestmentDTO[]> {
    return new ListMyInvestmentsController(this.queryRepository!).execute(ownerId)
  }

  async getMyPortfolio(ownerId: string): Promise<PortfolioDTO> {
    return new GetMyPortfolioController(this.queryRepository!).execute(ownerId)
  }
}

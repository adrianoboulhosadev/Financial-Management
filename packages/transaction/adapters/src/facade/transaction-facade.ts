import {
  TransactionRepository,
  TransactionQueryRepository,
  TransactionFilter,
  TransactionDTO,
  MonthlyTotalsDTO,
  RecurrenceRepository,
  RecurrenceQueryRepository,
  RecurrenceQueue,
  RecurrenceDTO,
} from '@transaction/core'
import {
  RecordTransactionController,
  UpdateTransactionController,
  DeleteTransactionController,
  ListMyTransactionsController,
  GetMyMonthlyTotalsController,
  CreateRecurrenceController,
  UpdateRecurrenceController,
  SetRecurrenceActiveController,
  DeleteRecurrenceController,
  ListMyRecurrencesController,
  RunRecurrenceController,
} from '../controllers'
import {
  RecordTransactionInput,
  UpdateTransactionInput,
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
  SetRecurrenceActiveInput,
} from '../@types'

/**
 * Single entry point the apps (backend and worker) call. Optional ports in the
 * constructor: each method uses only what it needs, so the worker can wire the
 * recurrence side alone and never touch the query repositories.
 *
 * `ownerId` is always the authenticated id resolved from the JWT, and
 * `categoryIsLeaf` is the answer the app already got from the `category`
 * context — this facade never looks it up itself.
 */
export default class TransactionFacade {
  constructor(
    private readonly transactionRepository?: TransactionRepository,
    private readonly transactionQueryRepository?: TransactionQueryRepository,
    private readonly recurrenceRepository?: RecurrenceRepository,
    private readonly recurrenceQueryRepository?: RecurrenceQueryRepository,
    private readonly recurrenceQueue?: RecurrenceQueue,
  ) {}

  async recordTransaction(
    input: RecordTransactionInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const controller = new RecordTransactionController(this.transactionRepository!)
    await controller.execute(input, ownerId, categoryIsLeaf)
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const controller = new UpdateTransactionController(this.transactionRepository!)
    await controller.execute(transactionId, input, ownerId, categoryIsLeaf)
  }

  async deleteTransaction(transactionId: string, ownerId: string): Promise<void> {
    await new DeleteTransactionController(this.transactionRepository!).execute(
      transactionId,
      ownerId,
    )
  }

  async listMyTransactions(ownerId: string, filter?: TransactionFilter): Promise<TransactionDTO[]> {
    return new ListMyTransactionsController(this.transactionQueryRepository!).execute(
      ownerId,
      filter,
    )
  }

  async getMyMonthlyTotals(ownerId: string, period: string): Promise<MonthlyTotalsDTO> {
    return new GetMyMonthlyTotalsController(this.transactionQueryRepository!).execute(
      ownerId,
      period,
    )
  }

  async createRecurrence(
    input: CreateRecurrenceInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const controller = new CreateRecurrenceController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
    )
    await controller.execute(input, ownerId, categoryIsLeaf)
  }

  async updateRecurrence(
    recurrenceId: string,
    input: UpdateRecurrenceInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const controller = new UpdateRecurrenceController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
    )
    await controller.execute(recurrenceId, input, ownerId, categoryIsLeaf)
  }

  async setRecurrenceActive(
    recurrenceId: string,
    input: SetRecurrenceActiveInput,
    ownerId: string,
  ): Promise<void> {
    const controller = new SetRecurrenceActiveController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
    )
    await controller.execute(recurrenceId, input, ownerId)
  }

  async deleteRecurrence(recurrenceId: string, ownerId: string): Promise<void> {
    await new DeleteRecurrenceController(this.recurrenceRepository!).execute(recurrenceId, ownerId)
  }

  async listMyRecurrences(ownerId: string): Promise<RecurrenceDTO[]> {
    return new ListMyRecurrencesController(this.recurrenceQueryRepository!).execute(ownerId)
  }

  /** System path (worker): posts the due occurrence and schedules the next. */
  async runRecurrence(recurrenceId: string): Promise<void> {
    const controller = new RunRecurrenceController(this.recurrenceRepository!, this.recurrenceQueue)
    await controller.execute(recurrenceId)
  }
}

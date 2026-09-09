import {
  TransactionRepository,
  TransactionQueryRepository,
  TransactionFilter,
  TransactionDTO,
  MonthlyTotalsDTO,
  RecurrenceRepository,
  RecurrenceQueryRepository,
  RecurrencePaymentRepository,
  RecurrenceQueue,
  RecurrenceDTO,
  MonthlyChecklistDTO,
} from '@transaction/core'
import {
  RecordTransactionController,
  UpdateTransactionController,
  DeleteTransactionController,
  ListMyTransactionsController,
  GetMyMonthlyTotalsController,
  GetSpentByCategoryController,
  CreateRecurrenceController,
  UpdateRecurrenceController,
  SetRecurrenceActiveController,
  DeleteRecurrenceController,
  ListMyRecurrencesController,
  RunRecurrenceController,
  GetMonthlyChecklistController,
  SetRecurrencePaidController,
  AdjustRecurrenceAmountController,
} from '../controllers'
import {
  RecordTransactionInput,
  UpdateTransactionInput,
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
  SetRecurrenceActiveInput,
  SetRecurrencePaidInput,
  AdjustRecurrenceAmountInput,
} from '../@types'

/**
 * Single entry point the apps (backend and worker) call. Optional ports in the
 * constructor: each method uses only what it needs, so the worker can wire the
 * recurrence side alone and never touch the query repositories.
 *
 * `ownerId` is always the authenticated id resolved from the JWT. Whether the
 * category/bank/card an input points at belongs to that user is confirmed by
 * the APP layer before it gets here — this facade never looks across contexts
 * itself.
 */
export default class TransactionFacade {
  constructor(
    private readonly transactionRepository?: TransactionRepository,
    private readonly transactionQueryRepository?: TransactionQueryRepository,
    private readonly recurrenceRepository?: RecurrenceRepository,
    private readonly recurrenceQueryRepository?: RecurrenceQueryRepository,
    private readonly recurrenceQueue?: RecurrenceQueue,
    private readonly recurrencePaymentRepository?: RecurrencePaymentRepository,
  ) {}

  async recordTransaction(input: RecordTransactionInput, ownerId: string): Promise<void> {
    const controller = new RecordTransactionController(this.transactionRepository!)
    await controller.execute(input, ownerId)
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
    ownerId: string,
  ): Promise<void> {
    const controller = new UpdateTransactionController(this.transactionRepository!)
    await controller.execute(transactionId, input, ownerId)
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

  /** The month's totals. When the recurrence port was wired in, they also
   * carry what the month still owes in fixed bills. */
  async getMyMonthlyTotals(ownerId: string, period: string): Promise<MonthlyTotalsDTO> {
    return new GetMyMonthlyTotalsController(
      this.transactionQueryRepository!,
      this.recurrenceQueryRepository,
    ).execute(ownerId, period)
  }

  /** System path (worker): how much a category consumed in a month, in cents. */
  async getSpentByCategory(ownerId: string, categoryId: string, period: string): Promise<number> {
    return new GetSpentByCategoryController(this.transactionQueryRepository!).execute(
      ownerId,
      categoryId,
      period,
    )
  }

  async createRecurrence(input: CreateRecurrenceInput, ownerId: string): Promise<void> {
    const controller = new CreateRecurrenceController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
    )
    await controller.execute(input, ownerId)
  }

  async updateRecurrence(
    recurrenceId: string,
    input: UpdateRecurrenceInput,
    ownerId: string,
  ): Promise<void> {
    const controller = new UpdateRecurrenceController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
    )
    await controller.execute(recurrenceId, input, ownerId)
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
    const controller = new RunRecurrenceController(
      this.recurrenceRepository!,
      this.recurrenceQueue,
      this.recurrencePaymentRepository,
    )
    await controller.execute(recurrenceId)
  }

  /** The month's to-do list of fixed bills — derived, never stored. */
  async getMonthlyChecklist(ownerId: string, period: string): Promise<MonthlyChecklistDTO> {
    return new GetMonthlyChecklistController(this.recurrenceQueryRepository!).execute(
      ownerId,
      period,
    )
  }

  async setRecurrencePaid(
    recurrenceId: string,
    input: SetRecurrencePaidInput,
    ownerId: string,
  ): Promise<void> {
    await new SetRecurrencePaidController(
      this.recurrenceRepository!,
      this.recurrencePaymentRepository!,
    ).execute(recurrenceId, input, ownerId)
  }

  /** What a VARIABLE bill actually came to this month. */
  async adjustRecurrenceAmount(
    recurrenceId: string,
    input: AdjustRecurrenceAmountInput,
    ownerId: string,
  ): Promise<void> {
    await new AdjustRecurrenceAmountController(
      this.recurrenceRepository!,
      this.recurrencePaymentRepository!,
    ).execute(recurrenceId, input, ownerId)
  }
}

import {
  RunRecurrence,
  RecurrenceRepository,
  RecurrenceQueue,
  RecurrencePaymentRepository,
} from '@transaction/core'

export default class RunRecurrenceController {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
    // Optional: what lets a variable bill post the figure the owner wrote down
    // for the month instead of the estimate.
    private readonly paymentRepository?: RecurrencePaymentRepository,
  ) {}

  async execute(recurrenceId: string): Promise<void> {
    const useCase = new RunRecurrence(this.repository, this.queue, this.paymentRepository)
    await useCase.execute({ recurrenceId })
  }
}

import { RecurrenceQueue, RecurrenceRunCommand } from '../../src'

export default class RecurrenceQueueInMemory implements RecurrenceQueue {
  readonly scheduled: RecurrenceRunCommand[] = []

  async scheduleRun(command: RecurrenceRunCommand): Promise<void> {
    this.scheduled.push(command)
  }

  get last(): RecurrenceRunCommand | undefined {
    return this.scheduled[this.scheduled.length - 1]
  }
}

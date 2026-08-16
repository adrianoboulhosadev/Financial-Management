export interface RecurrenceRunCommand {
  recurrenceId: string
  // Absolute time the occurrence is due (the recurrence's nextRunAt).
  at: Date
}

/**
 * Queue port that schedules the next run of a recurrence. Creating or editing
 * one asks this port to run it at `at`; the backend implements it with a BullMQ
 * DELAYED job and the worker consumes it (running RunRecurrence), which then
 * schedules the following month through this same port. The queue/job name
 * literals must match between producer and consumer.
 */
export interface RecurrenceQueue {
  scheduleRun(command: RecurrenceRunCommand): Promise<void>
}

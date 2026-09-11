/**
 * Where in the month a fixed bill falls. The owner does not think about their
 * commitments as "day 3, day 5, day 8" — they think about the rent at the start
 * and the card bill in the middle, which is what these three groups are.
 *
 * The last group is not about a DAY at all: a bill with an end date is the one
 * thing on this screen that will stop happening, and that is worth its own
 * block regardless of when in the month it lands.
 */
export type ScheduleGroupKey = 'start' | 'middle' | 'end' | 'ending'

export const SCHEDULE_GROUPS: { key: ScheduleGroupKey; title: string }[] = [
  { key: 'start', title: 'Começo do mês' },
  { key: 'middle', title: 'Meio do mês' },
  { key: 'end', title: 'Fim do mês' },
  { key: 'ending', title: 'Com prazo · terminam em breve' },
]

/** Which block a bill belongs to. A deadline wins over the day, because
 * "this one is ending" is the more useful thing to say about it. */
export function scheduleGroupOf(recurrence: {
  dayOfMonth: number
  endsOn: Date | null
}): ScheduleGroupKey {
  if (recurrence.endsOn) return 'ending'
  if (recurrence.dayOfMonth <= 10) return 'start'
  if (recurrence.dayOfMonth <= 20) return 'middle'
  return 'end'
}

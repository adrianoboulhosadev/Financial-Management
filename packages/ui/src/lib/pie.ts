/**
 * The geometry the month pie is drawn from.
 *
 * It lives in the shared package and not beside either chart because it is pure
 * trigonometry that BOTH apps need — the browser renders the `d` into an
 * `<svg>` and the phone hands the same string to react-native-svg. Two copies
 * of an arc formula is exactly how the same month ends up drawn two different
 * ways.
 */

const CENTER = 70
const RADIUS = 66

export const PIE_VIEWBOX = 140

function pointAt(fraction: number) {
  // −90° so the first slice starts at twelve o'clock, which is where a reader
  // expects a pie to begin.
  const angle = fraction * 2 * Math.PI - Math.PI / 2
  return [CENTER + RADIUS * Math.cos(angle), CENTER + RADIUS * Math.sin(angle)]
}

/**
 * The `d` of one wedge, from `start` to `start + size` as fractions of the
 * whole.
 *
 * A slice that IS the whole circle gets a two-arc circle instead of a wedge: at
 * exactly 100% the start and end points coincide, and an arc between a point
 * and itself draws nothing at all — the one input that would otherwise render
 * a month as an empty ring.
 */
export function wedgePath(start: number, size: number): string {
  if (size >= 1) {
    return `M${CENTER},${CENTER - RADIUS}A${RADIUS},${RADIUS} 0 1 1 ${CENTER},${CENTER + RADIUS}A${RADIUS},${RADIUS} 0 1 1 ${CENTER},${CENTER - RADIUS}Z`
  }

  const [x1, y1] = pointAt(start)
  const [x2, y2] = pointAt(start + size)
  const large = size > 0.5 ? 1 : 0

  return `M${CENTER},${CENTER}L${x1.toFixed(2)},${y1.toFixed(2)}A${RADIUS},${RADIUS} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}Z`
}

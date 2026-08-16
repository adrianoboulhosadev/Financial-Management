interface LoadingProps {
  /**
   * Only for the two auth-gate guards that render BEFORE the Sidebar/Header
   * shell — `(private)/layout.tsx` and `(public)/layout.tsx`. At that moment
   * Loading IS the entire page (no header exists yet to measure against), so it
   * has to claim the viewport itself.
   */
  fullScreen?: boolean
  /**
   * For a loading state embedded inside an already-rendered section — a card, a
   * list slot — where the rest of the page is already visible around it. Claims
   * no height of its own instead of shoving a page-sized spinner into a card.
   */
  compact?: boolean
}

/**
 * The default (no props) fills its parent with `h-full`, not a fixed vh: every
 * page renders this as the SOLE child of the private layout's `<main>`, which is
 * a `flex-1` box already computed to the exact remaining viewport height (screen
 * minus header — and the header can wrap on a narrow screen, changing that
 * height). A fixed `min-h-[50vh]` could never track that; `h-full` inherits
 * whatever `<main>` actually measured.
 *
 * `flex flex-col`, NOT `grid`: with two stacked children a grid container's
 * implicit rows stretch to evenly SHARE the box height and then center each row
 * inside its own half, opening a wrong gap between the spinner and the label.
 * Flex's `justify-center` centers the pair as one group.
 */
export function Loading({ fullScreen = false, compact = false }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        fullScreen ? 'min-h-screen' : compact ? 'py-8' : 'h-full min-h-[220px]'
      }`}
    >
      <span
        aria-hidden
        className={`animate-spinSlow rounded-full border-2 border-ink-border border-t-accent ${
          compact ? 'h-5 w-5' : 'h-8 w-8'
        }`}
      />
      <p className={`text-ink-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>Carregando…</p>
    </div>
  )
}

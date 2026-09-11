/**
 * What a wide browser gets instead of the app.
 *
 * Financial is designed as a phone app: every screen is one column sized for a
 * thumb, with the navigation under it. Stretched across a desktop monitor that
 * column becomes a ribbon of whitespace with a tab bar marooned at the bottom
 * — not a worse version of the app, a different and worse product. Saying so
 * plainly beats shipping a layout nobody designed.
 */
export function DesktopNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <span className="h-0.5 w-6 bg-accent" />
      <h1 className="text-xl font-medium tracking-[-0.01em] text-ink-text">
        Disponível no celular e no tablet
      </h1>
      <p className="max-w-[400px] text-[13px] leading-relaxed text-neutral-600">
        O Financial é um app. Esta versão web existe só para o desenvolvimento.
        <br />
        Reduza a janela para menos de 1024&nbsp;px para continuar por aqui.
      </p>
    </div>
  )
}

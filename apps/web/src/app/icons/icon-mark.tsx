import { ImageResponse } from 'next/og'
import { COLORS } from 'ui'

interface IconMarkOptions {
  size: number
  maskable?: boolean
}

/**
 * Renders the product's own mark — the "F" tile that opens the sidebar — as a
 * PNG at whatever size an icon slot needs. One generator instead of five
 * hand-drawn, near-identical PNGs, and the colours come from the shared tokens
 * so the home-screen icon can never drift from the app it opens.
 *
 * Maskable gets a smaller glyph on the same full-bleed ground: the OS applies
 * its own shape mask over the whole square, so only the centre safe zone is
 * guaranteed to survive.
 */
export function iconMarkResponse({ size, maskable = false }: IconMarkOptions) {
  const glyphSize = maskable ? size * 0.42 : size * 0.6

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.accent,
      }}
    >
      <div style={{ fontSize: glyphSize, fontWeight: 700, color: COLORS.ink.bg }}>F</div>
    </div>,
    { width: size, height: size },
  )
}

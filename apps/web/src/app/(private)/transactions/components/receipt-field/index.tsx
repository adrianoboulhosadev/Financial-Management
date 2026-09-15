'use client'

import { mediaUrl } from 'ui'
import { Kicker } from '@/components/kicker'
import { PlusIcon, TrashIcon } from '@/data/icons'

interface ReceiptFieldProps {
  /** The stored URL, or null when nothing is attached yet. */
  url: string | null
  onPick: (file: File) => void
  onRemove: () => void
  uploading: boolean
}

/**
 * The receipt of a movement — the nota, the boleto, the print of the pix.
 *
 * The file is a DOCUMENT: the backend never crops or re-encodes it (altering it
 * would be altering the proof), so this only picks it and shows that it is
 * there. Opening it is a plain link to the static `/uploads` path.
 *
 * `accept` mirrors what the route actually takes — image or PDF. It is a hint,
 * not a guarantee (the dialog lets anything through if the user insists), which
 * is why the backend validates too.
 */
export function ReceiptField({ url, onPick, onRemove, uploading }: ReceiptFieldProps) {
  return (
    <div>
      <Kicker className="mb-[7px]">Comprovante</Kicker>

      {url ? (
        <div className="flex items-center gap-3 rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3">
          <a
            href={mediaUrl(url)}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-[13px] text-accent-300 hover:underline"
          >
            Ver comprovante
          </a>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover comprovante"
            className="flex-none text-neutral-600 transition-colors hover:text-negative"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer items-center gap-2.5 rounded-field border border-dashed border-ink-border-strong px-3.5 py-3 text-[13px] transition-colors ${
            uploading ? 'text-neutral-600' : 'text-neutral-400 hover:text-ink-text'
          }`}
        >
          <PlusIcon size={16} />
          {uploading ? 'Enviando…' : 'Anexar nota ou comprovante'}
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onPick(file)
              // Cleared so picking the SAME file again still fires a change.
              event.target.value = ''
            }}
          />
        </label>
      )}
    </div>
  )
}

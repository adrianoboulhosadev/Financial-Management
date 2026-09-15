'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type {
  RecordTransactionInput,
  TransactionDTO,
  TransactionType,
  UpdateTransactionInput,
} from '@transaction/adapters'
import { discardReceipt, toCents, toDateInputValue, uploadReceipt } from 'ui'
import { notify } from '@/lib/notify'

interface TransactionFormFields {
  type: TransactionType
  categoryId: string
  description: string
  // Typed in reais; converted to cents on submit (see lib/money). On a split
  // purchase this is the TOTAL — the backend divides it.
  amount: string
  occurredOn: string
}

/** The payment block's own state. Kept apart from react-hook-form because the
 * three pickers depend on each other (a card belongs to a bank, instalments
 * only to credit) and clearing one from another is far clearer as plain state. */
interface PaymentFormFields {
  bankId: string
  paymentMethod: string
  cardId: string
  installments: string
}

const emptyForm = (): TransactionFormFields => ({
  type: 'expense',
  categoryId: '',
  description: '',
  amount: '',
  occurredOn: toDateInputValue(),
})

const emptyPayment = (): PaymentFormFields => ({
  bankId: '',
  paymentMethod: '',
  cardId: '',
  installments: '1',
})

/** In reais, as the money field shows it — the shape an amount has to be in to
 * be edited rather than retyped. */
const toReais = (cents: number) => (cents / 100).toFixed(2).replace('.', ',')

interface Options {
  onCreate: (input: RecordTransactionInput) => void
  onUpdate: (input: UpdateTransactionInput & { id: string }) => void
  /** The movement being corrected, or null to record a new one. */
  editing: TransactionDTO | null
}

/**
 * One form for both recording and correcting, because they ask the same
 * questions. What differs is what the DOMAIN accepts: `UpdateTransaction` takes
 * no `type` and no instalments (an expense does not become an income, and a 6x
 * turning into a 3x is a different set of rows), so in edit mode those two are
 * shown as fixed rather than offered and then refused.
 */
export function useTransactionForm({ onCreate, onUpdate, editing }: Options) {
  const form = useForm<TransactionFormFields>({ defaultValues: emptyForm() })
  const [categoryId, setCategoryId] = useState('')
  const [payment, setPayment] = useState<PaymentFormFields>(emptyPayment)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const type = form.watch('type')

  /**
   * A receipt uploaded in THIS session that no row points at yet. It is the
   * only file this form is allowed to throw away — the one already stored on
   * the movement being edited belongs to the record, not to the form.
   *
   * A ref and not state: nothing renders from it, and the cleanup below has to
   * read the value at the moment it runs rather than the one captured when the
   * effect was set up.
   */
  const pendingUpload = useRef<string | null>(null)

  const discardPending = () => {
    if (pendingUpload.current) void discardReceipt(pendingUpload.current)
    pendingUpload.current = null
  }

  /**
   * Opening on a row fills the form with it; opening on nothing clears it. Both
   * directions matter: without the reset, closing an edit and pressing + would
   * hand the new movement the old one's values.
   *
   * It keys on the row's ID, not on the `editing` object and not on `form`.
   * That is deliberate: re-running this while someone is typing would wipe what
   * they wrote, so the trigger has to be "a DIFFERENT movement is being edited"
   * and nothing else — not a new object identity from a refetch, and not
   * whatever react-hook-form decides about its own reference stability.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (editing) {
      form.reset({
        type: editing.type,
        categoryId: editing.categoryId ?? '',
        description: editing.description,
        amount: toReais(editing.amount),
        occurredOn: toDateInputValue(editing.occurredOn),
      })
      setCategoryId(editing.categoryId ?? '')
      setPayment({
        bankId: editing.bankId ?? '',
        paymentMethod: editing.paymentMethod ?? '',
        cardId: editing.cardId ?? '',
        installments: String(editing.installments),
      })
      setAttachmentUrl(editing.attachmentUrl)
      return
    }

    form.reset(emptyForm())
    setCategoryId('')
    setPayment(emptyPayment())
    setAttachmentUrl(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id ?? null])

  /**
   * Closing the sheet throws away whatever was uploaded and never saved. The
   * sheet UNMOUNTS its children when it closes, so this cleanup is what runs —
   * and it runs on switching to another movement too, which is the same
   * abandoned file by another name.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => discardPending, [])

  const patchPayment = (fields: Partial<PaymentFormFields>) =>
    setPayment((current) => ({ ...current, ...fields }))

  /**
   * The receipt goes up as soon as it is picked, and only its URL travels with
   * the form. Waiting for submit would mean a 10 MB body on every save and no
   * way to show what was attached before saving.
   */
  const attachReceipt = async (file: File) => {
    setUploading(true)
    try {
      // Swapping one receipt for another orphans the first — it goes now,
      // while its URL is still in hand.
      discardPending()
      const url = await uploadReceipt(receiptBody(file))
      pendingUpload.current = url
      setAttachmentUrl(url)
    } catch (error) {
      notify.failure(error, 'Não foi possível enviar o comprovante.')
    } finally {
      setUploading(false)
    }
  }

  const submit = form.handleSubmit((fields) => {
    // Saved from here on: the row points at the file, so it is no longer this
    // form's to throw away. Cleared even if the save then fails — the owner is
    // about to retry, and deleting the receipt under them would be worse than
    // leaving a file behind.
    pendingUpload.current = null

    if (editing) {
      onUpdate({
        id: editing.id,
        // An income may legitimately have none; an expense without one is
        // refused by the domain, and the field below marks it required.
        categoryId: categoryId || null,
        description: fields.description,
        amount: toCents(fields.amount),
        occurredOn: fields.occurredOn,
        attachmentUrl,
        bankId: payment.bankId || null,
        cardId: payment.cardId || null,
        paymentMethod: payment.paymentMethod || null,
      })
      return
    }

    onCreate({
      type: fields.type,
      categoryId: categoryId || null,
      description: fields.description,
      amount: toCents(fields.amount),
      occurredOn: fields.occurredOn,
      attachmentUrl,
      // Empty means "not informed", which the domain stores as null — an empty
      // string would be an unknown payment method.
      bankId: payment.bankId || null,
      cardId: payment.cardId || null,
      paymentMethod: payment.paymentMethod || null,
      installments: payment.paymentMethod === 'credit' ? Number(payment.installments) || 1 : 1,
    })
  })

  return {
    form,
    submit,
    type,
    isEditing: editing !== null,
    categoryId,
    setCategoryId,
    payment,
    setBankId: (bankId: string) => patchPayment({ bankId }),
    setPaymentMethod: (paymentMethod: string) => patchPayment({ paymentMethod }),
    setCardId: (cardId: string) => patchPayment({ cardId }),
    setInstallments: (installments: string) => patchPayment({ installments }),
    attachmentUrl,
    attachReceipt,
    removeReceipt: () => {
      discardPending()
      setAttachmentUrl(null)
    },
    uploading,
    // Only an expense must land on a category — that is the tree's whole point.
    categoryRequired: type === 'expense',
  }
}

/** The browser's half of the multipart body — a real `File` from the input. */
function receiptBody(file: File): FormData {
  const body = new FormData()
  body.append('file', file)
  return body
}

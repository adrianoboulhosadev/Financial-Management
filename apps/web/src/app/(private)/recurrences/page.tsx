'use client'

import Link from 'next/link'
import { formatBRL, TRANSACTION_TYPES } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { Checkbox } from '@/components/checkbox'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { PaymentFields } from '@/components/payment-fields'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { PlusIcon, RecurrencesIcon, TrashIcon } from '@/data/icons'
import { useRecurrences } from './hooks/use-recurrences'

/**
 * What repeats every month — rent, a subscription, a course. On its day the
 * worker posts the movement on its own and the owner gets a notification; this
 * screen is where the rules are set, and "A pagar" is where the month is ticked
 * off.
 *
 * The list is grouped by WHERE IN THE MONTH the bill falls, because that is how
 * the money actually arrives and leaves — not alphabetically, and not by size.
 */
export default function RecurrencesPage() {
  const page = useRecurrences()

  return (
    <>
      <ScreenHeader
        title="Fixos do mês"
        backHref="/more"
        bordered
        action={
          <button
            type="button"
            onClick={page.openComposer}
            aria-label="Novo lançamento fixo"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
        subtitle={
          <>
            {page.recurrences.length}{' '}
            {page.recurrences.length === 1 ? 'compromisso' : 'compromissos'} ·{' '}
            {formatBRL(page.monthlyCents)} por mês
            {page.incomeShare !== null && ` · ${page.incomeShare}% do que entra`}
          </>
        }
      />

      <div className="px-5 pb-8 pt-4">
        {page.loading ? (
          <Loading compact />
        ) : page.recurrences.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento fixo"
            description="Cadastre o que se repete todo mês e pare de lançar na mão."
            action={<Button onClick={page.openComposer}>Cadastrar fixo</Button>}
          />
        ) : (
          <>
            {page.groups.map((group, groupIndex) => (
              <section key={group.key}>
                <Kicker className={`pb-1 ${groupIndex === 0 ? '' : 'pt-[18px]'}`}>
                  {group.title}
                </Kicker>

                {group.items.map((recurrence, index) => (
                  <ListRow key={recurrence.id} last={index === group.items.length - 1}>
                    <IconBadge tone={recurrence.active ? 'accent' : 'muted'}>
                      <RecurrencesIcon size={17} />
                    </IconBadge>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[13px] ${
                          recurrence.active
                            ? ''
                            : 'text-neutral-500 line-through decoration-neutral-700'
                        }`}
                      >
                        {recurrence.description}
                      </p>
                      <p
                        className={`mt-[3px] truncate text-[11px] ${
                          recurrence.variableAmount ? 'text-warning' : 'text-neutral-600'
                        }`}
                      >
                        {page.captionFor(recurrence)}
                      </p>
                      {page.deadlineLabelFor(recurrence) && (
                        <p className="mt-0.5 text-[11px] text-accent-300">
                          {page.deadlineLabelFor(recurrence)}
                        </p>
                      )}
                    </div>

                    <Amount
                      cents={recurrence.amount}
                      tone={recurrence.active ? 'neutral' : 'muted'}
                      className="flex-none text-[13px]"
                    />

                    <button
                      type="button"
                      onClick={() => page.toggleActive(recurrence)}
                      className="flex-none text-[11px] text-accent-300 hover:underline"
                    >
                      {recurrence.active ? 'Pausar' : 'Retomar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => page.askToDelete(recurrence)}
                      aria-label={`Excluir ${recurrence.description}`}
                      className="flex-none text-neutral-700 transition-colors hover:text-negative"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </ListRow>
                ))}
              </section>
            ))}

            <p className="mt-5 text-[11px] leading-relaxed text-neutral-600">
              Para marcar o que já pagou neste mês, veja{' '}
              <Link href="/checklist" className="text-accent-300 hover:underline">
                A pagar
              </Link>
              .
            </p>
          </>
        )}
      </div>

      <Sheet open={page.composing} title="Novo lançamento fixo" onClose={page.closeComposer}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.description.trim() && page.amount) page.create()
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-1.5">
            {TRANSACTION_TYPES.map((option) => (
              <Chip
                key={option.value}
                active={page.type === option.value}
                onClick={() => page.setType(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>

          <Field
            label="Descrição"
            placeholder="Aluguel, streaming…"
            value={page.description}
            onChange={(event) => page.setDescription(event.target.value)}
          />
          <Field
            label={page.variableAmount ? 'Valor aproximado (R$)' : 'Valor (R$)'}
            money
            placeholder="0,00"
            value={page.amount}
            onChange={(event) => page.setAmount(event.target.value)}
          />
          <Field
            label="Dia do mês"
            type="number"
            min={1}
            max={31}
            value={page.dayOfMonth}
            onChange={(event) => page.setDayOfMonth(event.target.value)}
          />
          <CategoryPicker
            value={page.categoryId}
            onChange={page.setCategoryId}
            allowEmpty={!page.categoryRequired}
          />

          {/* Declared at creation and never editable afterwards — flipping it
              on a bill whose months were already corrected would leave figures
              nobody could explain. */}
          <Checkbox
            label="O valor muda todo mês"
            hint="Conta de luz, água, cartão. Você informa um valor aproximado agora e ajusta em A pagar quando a conta chegar."
            checked={page.variableAmount}
            onChange={(event) => page.setVariableAmount(event.target.checked)}
          />

          {/* A course that lasts 8 months: after the deadline the bill leaves
              the month's list on its own, with nobody having to pause it. */}
          <Checkbox
            label="Tem prazo para acabar"
            hint="Curso, financiamento, parcelamento. Depois do último mês ele sai sozinho de A pagar."
            checked={page.hasDeadline}
            onChange={(event) => page.setHasDeadline(event.target.checked)}
          />

          {page.hasDeadline && (
            <Field
              label="Dura quantos meses"
              type="number"
              min={1}
              max={600}
              value={page.durationMonths}
              onChange={(event) => page.setDurationMonths(event.target.value)}
            />
          )}

          <Checkbox
            label="Já é pago automaticamente"
            hint="Pix programado ou débito automático: entra como pago na data do vencimento, sem você precisar marcar."
            checked={page.autoPaid}
            onChange={(event) => page.setAutoPaid(event.target.checked)}
          />

          <PaymentFields
            bankId={page.bankId}
            onBankChange={page.setBankId}
            paymentMethod={page.paymentMethod}
            onPaymentMethodChange={page.setPaymentMethod}
            cardId={page.cardId}
            onCardChange={page.setCardId}
          />

          {/* Day 31 does not exist every month; the domain clamps it instead of
              skipping or rolling over, and saying so here avoids the surprise. */}
          {Number(page.dayOfMonth) > 28 && (
            <p className="text-[10.5px] text-neutral-600">
              Em meses mais curtos, o lançamento entra no último dia do mês.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              page.creating ||
              !page.description.trim() ||
              !page.amount ||
              (page.categoryRequired && !page.categoryId)
            }
          >
            {page.creating ? 'Criando…' : 'Criar'}
          </Button>
        </form>
      </Sheet>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir lançamento fixo"
        description="Os lançamentos que ele já criou continuam no histórico — só para de gerar novos."
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </>
  )
}

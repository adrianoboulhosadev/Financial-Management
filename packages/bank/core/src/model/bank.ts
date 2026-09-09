import { Entity, EntityProps, ValidationError, Errors } from 'shared'

export interface BankProps extends EntityProps {
  // Logical FK to the User. There is no shared catalogue: each person
  // registers the banks THEY use, and nobody sees anybody else's.
  ownerId?: string
  name?: string
  // Both optional on purpose: what the product needs is a name to file a
  // payment under, and most people would rather not type an account number
  // into a budgeting app.
  agency?: string | null
  accountNumber?: string | null
}

/**
 * A bank the owner keeps money in. Rich entity, small on purpose: the only
 * invariant it owns is that a bank has a name, and that the optional
 * identifiers are stored trimmed or not at all — an empty string pretending to
 * be an agency number is worse than no agency number.
 */
export class Bank extends Entity<Bank, BankProps> {
  static readonly MAX_NAME_LENGTH = 80

  readonly ownerId: string
  name: string
  agency: string | null
  accountNumber: string | null

  constructor(props: BankProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')

    this.ownerId = ownerId
    this.name = Bank.validName(props.name)
    this.agency = Bank.optional(props.agency)
    this.accountNumber = Bank.optional(props.accountNumber)
  }

  /** True when this bank belongs to the given user — the anti-IDOR check every
   * use case runs before touching it. */
  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** Validated before anything is assigned, so a rejected edit leaves the bank
   * exactly as it was. */
  edit(fields: { name?: string; agency?: string | null; accountNumber?: string | null }): void {
    const name = fields.name !== undefined ? Bank.validName(fields.name) : this.name

    this.name = name
    if (fields.agency !== undefined) this.agency = Bank.optional(fields.agency)
    if (fields.accountNumber !== undefined) {
      this.accountNumber = Bank.optional(fields.accountNumber)
    }
  }

  private static validName(name?: string): string {
    const trimmed = name?.trim() ?? ''
    if (!trimmed) ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')
    if (trimmed.length > Bank.MAX_NAME_LENGTH) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')
    }
    return trimmed
  }

  /** Blank and absent mean the same thing here, and only one of them is worth
   * storing. */
  private static optional(value?: string | null): string | null {
    const trimmed = value?.trim() ?? ''
    return trimmed ? trimmed : null
  }
}

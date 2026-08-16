import { Entity, EntityProps, ValidationError, Errors } from 'shared'

export interface CategoryProps extends EntityProps {
  // Logical FK to the User who owns this tree. There is no shared catalogue:
  // two people may each have their own "Lazer", and neither can see the other's.
  ownerId?: string
  name?: string
  // Parent node in the tree; null/absent = a root category. Not editable after
  // creation (moving nodes is out of scope) — only the name can change.
  parentId?: string | null
}

/**
 * Rich category node of a self-referential tree (e.g. casa → contas → luz).
 * A transaction always lands on a LEAF; whether a node is a leaf is a
 * read-model concern (computed by the query side), so it is not stored here.
 */
export class Category extends Entity<Category, CategoryProps> {
  readonly ownerId: string
  name: string
  readonly parentId: string | null

  constructor(props: CategoryProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const name = props.name?.trim() ?? ''
    if (!name) ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')

    this.ownerId = ownerId
    this.name = name
    this.parentId = props.parentId ?? null
  }

  /** True when this node belongs to the given user — the anti-IDOR check every
   * use case runs before touching it. */
  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  rename(name: string): void {
    const trimmed = name.trim()
    if (!trimmed) ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')
    this.name = trimmed
  }
}

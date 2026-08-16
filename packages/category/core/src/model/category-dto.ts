/** READ projection (CQRS) of a category node, with the computed leaf flag. */
export interface CategoryDTO {
  id: string
  ownerId: string
  name: string
  parentId: string | null
  // true when the node has no children — only leaves can receive a transaction
  // or a budget.
  isLeaf: boolean
}

import { FindUserByIdQuery, UserQueryRepository, UserDTO } from '@auth/core'

export default class FindUserByIdController {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  // The use case returns the full UserDTO; the controller (presenter) trims it
  // down to what the front needs — the identity, nothing else.
  async execute(id: string): Promise<Pick<UserDTO, 'id' | 'email'>> {
    const useCase = new FindUserByIdQuery(this.userQueryRepository)
    const user = await useCase.execute(id)
    return { id: user.id, email: user.email }
  }
}

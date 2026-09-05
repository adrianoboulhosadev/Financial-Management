import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { ChangePasswordInput, UpdateProfileInput, UserDTO, UserFacade } from '@auth/adapters'
import { PrismaUserRepository } from '../auth/prisma-user-repository'
import { PrismaAuthSessionRepository } from '../auth/prisma-auth-session-repository'
import { BcryptHashProvider } from '../auth/bcrypt-hash-provider'
import { authenticatedUser } from '../shared/authenticated-user.decorator'

// Routes protected by the AuthMiddleware (see user.module). The userId ALWAYS
// comes from the token (anti-IDOR), never from a route parameter.
@Controller('user')
export class UserController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly sessionRepository: PrismaAuthSessionRepository,
    private readonly hashProvider: BcryptHashProvider,
  ) {}

  // Optional ports: each method uses only what it needs (change-password, logout, deactivate).
  private facade(): UserFacade {
    return new UserFacade(
      this.userRepository,
      undefined,
      this.hashProvider,
      undefined,
      this.sessionRepository,
    )
  }

  // Has the full UserDTO available (the middleware already read it fresh), so
  // the presenter just returns what the front needs.
  @Get('me')
  me(@authenticatedUser() user: UserDTO): Pick<UserDTO, 'id' | 'email' | 'nickname' | 'avatarUrl'> {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    }
  }

  // Display-only edit (nickname/avatar) — never email/password.
  @Patch('me')
  @HttpCode(204)
  async updateProfile(@Body() input: UpdateProfileInput, @authenticatedUser() user: UserDTO) {
    await this.facade().updateProfile(input, user.id)
  }

  @Patch('change-password')
  @HttpCode(204)
  async changePassword(@Body() input: ChangePasswordInput, @authenticatedUser() user: UserDTO) {
    await this.facade().changePassword(input, user.id)
  }

  // The refresh identifies WHICH device is logging out, so it comes from
  // wherever this client keeps it: the cookie (web) or the body (mobile). With
  // neither, the use case is a harmless no-op and the other devices stay signed
  // in — which is the correct outcome, not a failure.
  @Post('logout')
  @HttpCode(204)
  async logout(
    @authenticatedUser() user: UserDTO,
    @Body() input: { refreshToken?: string } | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = input?.refreshToken ?? request.cookies?.['refreshToken']
    await this.facade().logoutUser(user.id, refreshToken)
    response.clearCookie('refreshToken', { path: '/' })
  }

  @Delete('deactivate')
  @HttpCode(204)
  async deactivate(@authenticatedUser() user: UserDTO) {
    await this.facade().deactivateUser(user.id)
  }
}

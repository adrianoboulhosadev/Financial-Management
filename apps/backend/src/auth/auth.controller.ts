import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { UnauthorizedError, Errors } from 'shared'
import { LoginUserInput, RegisterUserInput, LoginWithGoogleInput, UserFacade } from '@auth/adapters'
import { PrismaUserRepository } from './prisma-user-repository'
import { PrismaAuthSessionRepository } from './prisma-auth-session-repository'
import { PrismaOAuthAccountRepository } from './prisma-oauth-account-repository'
import { BcryptHashProvider } from './bcrypt-hash-provider'
import { JsonWebTokenProvider } from './jsonwebtoken-jwt-provider'
import { GoogleOAuthVerifier } from './google-oauth-verifier'
import { REFRESH_COOKIE_OPTIONS } from './refresh-cookie-options'
import { clientTypeOf } from './client-type'
import { GoogleLoginGuard } from './google-login.guard'
import { DomainEventListener } from '../notification/domain-event-listener'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly sessionRepository: PrismaAuthSessionRepository,
    private readonly hashProvider: BcryptHashProvider,
    private readonly jwtProvider: JsonWebTokenProvider,
    private readonly oauthAccountRepository: PrismaOAuthAccountRepository,
    private readonly googleVerifier: GoogleOAuthVerifier,
    private readonly events: DomainEventListener,
  ) {}

  // Optional ports: each method uses only what it needs (register, login, refresh).
  private facade(): UserFacade {
    return new UserFacade(
      this.userRepository,
      undefined,
      this.hashProvider,
      this.jwtProvider,
      this.sessionRepository,
      this.oauthAccountRepository,
      this.googleVerifier,
      this.events,
    )
  }

  /**
   * Hands the freshly issued pair to the caller, and this is the ONE place that
   * decides where the refresh token goes:
   *
   * - **web**: into an `httpOnly` cookie. JavaScript never sees it, which is
   *   exactly the protection an XSS would otherwise defeat.
   * - **mobile**: into the response BODY. React Native has no cookie jar worth
   *   trusting, so the app stores it in the Keychain/Keystore instead (see the
   *   TokenStorage port). Handing it over in the body is only acceptable
   *   BECAUSE the destination is device-encrypted storage, not `localStorage`.
   *
   * The domain does not know about any of this: LoginUser issues the same pair
   * either way.
   */
  private issue(
    request: Request,
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): { accessToken: string; refreshToken?: string } {
    if (clientTypeOf(request) === 'mobile') return tokens

    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
    return { accessToken: tokens.accessToken }
  }

  // The account is born pending (see the front door in CLAUDE.md); telling the
  // admins someone is at the gate is the DomainEventListener's job, off the
  // UserRegistered event the use case publishes.
  @Post('register')
  async register(@Body() input: RegisterUserInput) {
    await this.facade().registerUser(input)
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() input: LoginUserInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.facade().loginUser(input)
    return this.issue(request, response, tokens)
  }

  // Reads the current refresh from wherever this client keeps it: the cookie
  // (web) or the body (mobile). The rotation itself is identical — the use case
  // never learns which one it came from.
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() input: { refreshToken?: string } | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentToken = input?.refreshToken ?? request.cookies?.['refreshToken']
    if (!currentToken) UnauthorizedError.throwError(Errors.NOT_AUTHENTICATED)

    const tokens = await this.facade().refreshToken(currentToken, process.env.JWT_SECRET!)
    return this.issue(request, response, tokens)
  }

  // "Sign in with Google": the front runs the OAuth handshake through NextAuth
  // (a disposable bridge — see apps/web) and posts the resulting Google ID
  // token here. The token is verified against Google's JWKS (GoogleOAuthVerifier)
  // — never trusted as-is — then the SAME access/refresh session as /login is
  // issued (identical cookie + response contract).
  // Closed with a plain 404 while GOOGLE_CLIENT_ID is unset — see the guard.
  @Post('oauth/google')
  @UseGuards(GoogleLoginGuard)
  @HttpCode(200)
  async loginWithGoogle(
    @Body() input: LoginWithGoogleInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.facade().loginWithGoogle(input)
    return this.issue(request, response, tokens)
  }
}

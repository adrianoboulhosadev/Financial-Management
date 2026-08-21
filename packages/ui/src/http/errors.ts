import { AxiosError } from 'axios'
import { ERROR_MESSAGES } from '../data/error-messages'

interface ErrorEnvelope {
  statusCode?: number
  errors?: Array<{ code: string }>
}

/**
 * Extracts a displayable message from a request failure. The backend answers in
 * two shapes: a domain error -> `{ errors: [{ code }] }`; a Nest HttpException
 * -> a string. The friendly text comes from the static map.
 */
export function errorMessage(
  error: unknown,
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data
    if (typeof body === 'string' && body.trim()) return body
    const code = (body as ErrorEnvelope | undefined)?.errors?.[0]?.code
    if (code) return ERROR_MESSAGES[code] ?? fallback
  }
  return fallback
}

/** The first domain code of a failure, when the caller needs to branch on it
 * (the login does, to route a pending account to its own screen). */
export function errorCode(error: unknown): string | null {
  if (!(error instanceof AxiosError)) return null
  const body = error.response?.data as ErrorEnvelope | undefined
  return body?.errors?.[0]?.code ?? null
}

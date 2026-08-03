const TRANSIENT_DB_ERROR_PATTERN =
  /P1001|P1002|P1008|P1017|connection pool|Can't reach database|Server has closed|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|timeout/i

export function isTransientDbError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return TRANSIENT_DB_ERROR_PATTERN.test(error.message)
}

type WithDbRetryOptions = {
  retries?: number
  label?: string
}

/**
 * Retries transient Neon/Prisma connection failures so unstable_cache
 * does not persist empty fallbacks from cold starts.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: WithDbRetryOptions = {}
): Promise<T> {
  const { retries = 3, label = 'db query' } = options
  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === retries - 1

      if (!isTransientDbError(error) || isLastAttempt) {
        console.error(`[${label}] failed after ${attempt + 1} attempt(s):`, error)
        throw error
      }

      const delayMs = 1000 * (attempt + 1)
      console.warn(
        `[${label}] transient error, retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})`
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

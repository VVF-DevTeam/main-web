const DEFAULT_CONNECT_TIMEOUT = '15'
const DEFAULT_POOL_TIMEOUT = '15'

/**
 * Ensures Neon-recommended timeout params are present on DATABASE_URL.
 * See: https://neon.com/docs/guides/prisma#connection-timeouts
 */
export function ensureNeonConnectionParams(
  connectionString: string | undefined
): string | undefined {
  if (!connectionString) return connectionString

  try {
    const url = new URL(connectionString)

    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', DEFAULT_CONNECT_TIMEOUT)
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', DEFAULT_POOL_TIMEOUT)
    }

    return url.toString()
  } catch {
    let result = connectionString
    const appendParam = (key: string, value: string) => {
      if (result.includes(`${key}=`)) return
      result += `${result.includes('?') ? '&' : '?'}${key}=${value}`
    }

    appendParam('connect_timeout', DEFAULT_CONNECT_TIMEOUT)
    appendParam('pool_timeout', DEFAULT_POOL_TIMEOUT)
    return result
  }
}

export function warnIfMissingPoolerInProduction(): void {
  const databaseUrl = process.env.DATABASE_URL

  if (
    process.env.NODE_ENV === 'production' &&
    databaseUrl &&
    !databaseUrl.includes('-pooler')
  ) {
    console.warn(
      '[db] DATABASE_URL should use the Neon pooled endpoint (-pooler hostname) for serverless deployments.'
    )
  }
}

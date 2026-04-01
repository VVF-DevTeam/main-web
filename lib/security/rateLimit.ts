type LimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type Bucket = {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

const now = () => Date.now()

export const getClientIp = (forwardedForHeader: string | null): string => {
  if (!forwardedForHeader) return 'unknown'

  const firstIp = forwardedForHeader.split(',')[0]?.trim()
  return firstIp || 'unknown'
}

export const checkRateLimit = ({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): LimitResult => {
  const current = now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= current) {
    store.set(key, { count: 1, resetAt: current + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - current) / 1000)
      ),
    }
  }

  existing.count += 1
  store.set(key, existing)
  return { allowed: true, retryAfterSeconds: 0 }
}

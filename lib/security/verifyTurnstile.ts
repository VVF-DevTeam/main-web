export async function verifyTurnstileToken(token: string, ip?: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) return { ok: false, error: 'Missing Turnstile secret' }
    if (!token) return { ok: false, error: 'Missing Turnstile token' }
    const formData = new URLSearchParams()
    formData.append('secret', secret)
    formData.append('response', token)
    if (ip) formData.append('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        cache: 'no-store',
    })
    const data = await res.json()
    return { ok: Boolean(data.success), data }
}
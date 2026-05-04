import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal - Viet Vibe Foundation',
  description: 'Internal operations portal for staff',
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium">Welcome</h2>
      <p className="text-sm text-slate-300">
        You are viewing the internal portal entry page.
      </p>
      <p className="text-sm text-slate-400">Current locale: {locale}</p>
    </section>
  )
}

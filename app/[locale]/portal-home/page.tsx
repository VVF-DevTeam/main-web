import type { Metadata } from 'next'
import Link from 'next/link'

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
      <p className="text-sm">
        <Link
          href={`/${locale}/portal-home/coding-rule`}
          className="font-medium text-textColor-blue underline decoration-textColor-blue/60 underline-offset-4 hover:text-textColor-secondary600"
        >
          Portal coding rules
        </Link>
      </p>
    </section>
  )
}

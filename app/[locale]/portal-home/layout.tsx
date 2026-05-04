import type { ReactNode } from 'react'

type PortalLayoutProps = {
  children: ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Staff Portal</h1>
        <p className="text-sm text-slate-300">
          Internal operations area for Viet Vibe Foundation.
        </p>
        <main className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EngageCollapsibleSectionProps {
  title: string
  subtitle?: string
  /** When false, section starts collapsed (default). */
  defaultOpen?: boolean
  children: ReactNode
}

export function EngageCollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: EngageCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen)

  useEffect(() => {
    if (open) setHasBeenOpened(true)
  }, [open])

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 md:px-8"
      >
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-neutral-900 md:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-bgColor-brand900 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {hasBeenOpened ? (
        <div
          hidden={!open}
          className={cn(
            'border-t border-slate-100 px-5 py-5 md:px-8 md:py-6',
            !open && 'hidden'
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}

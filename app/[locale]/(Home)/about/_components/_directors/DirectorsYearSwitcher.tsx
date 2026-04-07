'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface DirectorsYearSwitcherProps {
  periodLabels: string[]
  prevLabel: string
  nextLabel: string
  children: React.ReactNode
}

const DirectorsYearSwitcher = ({
  periodLabels,
  prevLabel,
  nextLabel,
  children,
}: DirectorsYearSwitcherProps) => {
  const n = periodLabels.length
  const [index, setIndex] = useState(0)

  const panels = useMemo(() => React.Children.toArray(children), [children])

  const goPrev = () => {
    if (n <= 1) return
    setIndex((i) => (i - 1 + n) % n)
  }

  const goNext = () => {
    if (n <= 1) return
    setIndex((i) => (i + 1) % n)
  }

  if (n === 0) {
    return null
  }

  return (
    <div className="width-max-default mx-auto w-full p-6 md:p-8 lg:p-12">
      {n > 1 && (
        <div className="mb-10 flex items-center justify-center gap-4 sm:gap-8">
          <button
            type="button"
            onClick={goPrev}
            aria-label={prevLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bgColor-brandDark900/20 text-textColor-brandDark900 transition-colors hover:bg-bgColor-brandDark900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textColor-brandDark900"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <span className="min-w-[8rem] text-center text-lg font-semibold tracking-wide text-textColor-brandDark900 sm:min-w-[10rem] sm:text-xl">
            {periodLabels[index]}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bgColor-brandDark900/20 text-textColor-brandDark900 transition-colors hover:bg-bgColor-brandDark900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textColor-brandDark900"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </div>
      )}

      {n === 1 && (
        <p className="mb-10 text-center text-lg font-semibold tracking-wide text-textColor-brandDark900 sm:text-xl">
          {periodLabels[0]}
        </p>
      )}

      <div className="flex flex-col gap-y-20 lg:gap-y-32">
        {panels.map((panel, idx) => (
          <div key={periodLabels[idx] ?? idx} hidden={idx !== index}>
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DirectorsYearSwitcher

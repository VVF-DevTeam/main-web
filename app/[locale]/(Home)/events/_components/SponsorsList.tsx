'use client'

import React from 'react'
import Image from 'next/image'
import { EventSponsor } from '@prisma/client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface SponsorsListProps {
  sponsors: EventSponsor[]
  headerText: string
}

const SponsorsList = ({ sponsors, headerText }: SponsorsListProps) => {
  const handleSponsorClick = (sponsor: EventSponsor) => {
    if (sponsor.url) {
      window.open(sponsor.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-w-full py-2">
      <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
        {headerText}
      </h1>
      <div className="flex w-full gap-x-4 pt-4">
        {sponsors.map((sponsor) => (
          <TooltipProvider key={sponsor.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`group flex w-[200px] flex-col items-center justify-center gap-y-2 ${
                    sponsor.url ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleSponsorClick(sponsor)}
                >
                  <Image
                    src={sponsor.imgUrl}
                    alt={sponsor.name}
                    width={150}
                    height={150}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  {sponsor.displayName && (
                    <span className="text-sm font-medium">{sponsor.name}</span>
                  )}
                </div>
              </TooltipTrigger>
              {sponsor.url && (
                <TooltipContent side="bottom" className="bg-bgColor-secondary600">
                  <p className="text-sm text-textColor-brand900">Learn More</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

export default SponsorsList


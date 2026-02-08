'use client'

import React from 'react'
import Image from 'next/image'
import { EventSponsor, SponsorTier } from '@prisma/client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

type SponsorWithTier = {
  tier: SponsorTier
  sponsor: EventSponsor
}

interface SponsorsListProps {
  sponsors: SponsorWithTier[]
  headerText: string
}

const SponsorsList = ({ sponsors, headerText }: SponsorsListProps) => {
  const handleSponsorClick = (sponsor: EventSponsor) => {
    if (sponsor.url) {
      window.open(sponsor.url, '_blank', 'noopener,noreferrer')
    }
  }

  const getTierImageUrl = (tier: SponsorTier) => {
    // TODO: Replace these placeholder IDs with your actual Google Drive image IDs
    const tierImageIds: Record<SponsorTier, string> = {
      Platinum: '1APFDUMHlQIC2-TmDrcLWK_Yf23DyOtli',
      Gold: '1cL1WO25aIvmXRGgscdPC4MwjKaDphe3f',
      Silver: '1pGdPE3OMQeoUCkKqXrdYo9SlaYRdr5ps',
      Bronze: '1ZfS4aPyqOeR07AilU9_zzOP_wZVpG5gW',
    }

    return `https://drive.google.com/thumbnail?id=${tierImageIds[tier]}`
  }

  return (
    <div className="w-full py-2">
      <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
        {headerText}
      </h1>

      <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4">
        {sponsors.map((item) => (
          <div
            key={item.sponsor.id}
            className="flex w-full flex-col items-center justify-center"
          >
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`group flex w-full flex-col items-center justify-center gap-y-2 ${
                      item.sponsor.url ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => handleSponsorClick(item.sponsor)}
                  >
                    <div className="relative">
                      <Image
                        src={item.sponsor.imgUrl}
                        alt={item.sponsor.name}
                        width={150}
                        height={150}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      {/* Tier Badge - Bottom Left Corner (Outside) - Only show if not a partner */}
                      {!item.sponsor.isPartner && (
                        <div
                          className="absolute -bottom-3 -left-6 h-10 w-10 overflow-hidden rounded-full"
                          title={`${item.tier} Sponsor`}
                        >
                          <Image
                            src={getTierImageUrl(item.tier)}
                            alt={`${item.tier} tier`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-center text-sm font-medium">
                      {item.sponsor.displayName && (
                        <span>{item.sponsor.name} - </span>
                      )}
                      <span>
                        {item.sponsor.isPartner ? 'Partner' : `${item.tier} Sponsor`}
                      </span>
                    </span>
                  </div>
                </TooltipTrigger>
                {item.sponsor.url && (
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-bgColor-secondary600"
                    sideOffset={5}
                  >
                    <p className="text-sm text-textColor-brand900">
                      Learn More
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SponsorsList

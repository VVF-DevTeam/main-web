import React from 'react'
import GridCard from '../../_components/gridCard'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
const cardsData = [
  {
    id: 1,
    name: 'Sports and Tournaments',
    desc: 'From exciting friendly competitions to hands-on skill-building sessions, we invite everyone - regardless of age or experience - to join in.',
  },
  {
    id: 2,
    name: 'Music and Workshops',
    desc: 'With professional performers engaging in a wide range of instruments and skills (guitar, piano, drum, dance, etc).',
  },

  {
    id: 3,
    name: 'Activities and Events',
    desc: 'We believe everyone deserves the chance to participate in activities and events that help them grow and build strong connections.',
  },
]
const OrgSummary = () => {
  return (
    <div className="bg-[#ffc48f]/50 py-12 lg:py-16">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-center gap-y-10 p-6">
        <div className="flex flex-col items-center justify-center p-6 lg:px-10">
          <div className="relative aspect-video min-h-[180px] min-w-[180px] lg:w-[23vw] xl:h-[18vh]">
            <Image
              src="/company-logo.png"
              alt="Org Logo"
              fill
              className="absolute object-contain duration-500 ease-in-out hover:scale-110"
            />
          </div>
          <Separator className="w-3/4 bg-[#B83AB3] xl:mt-4" />
        </div>
        <div className="grid grid-cols-1 content-center justify-items-center gap-4 md:grid-cols-3 lg:gap-x-6 xl:gap-x-24">
          {cardsData.map((card) => (
            <GridCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrgSummary

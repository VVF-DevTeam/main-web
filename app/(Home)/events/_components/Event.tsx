import React from 'react'
import Image from 'next/image'

import { Separator } from '@/components/ui/separator'
interface EventProps {
  day: string
  name: string
  location: string
  thumbnail: string
}

const Event = ({ day, location, thumbnail }: EventProps) => {
  return (
    <div className="py-6">
      <div className="flex-start flex h-full w-full flex-col gap-y-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-center gap-x-8 text-xl font-light md:justify-normal lg:text-2xl">
          <Image
            src={thumbnail}
            alt="Event Thumbnail"
            width={140}
            height={140}
            className="rounded-sm object-cover"
          />
          <span>{day}</span>
          <span>{location}</span>
        </div>
        <button className="rounded-full bg-[#1B171A] px-6 py-2 transition-all duration-75 ease-out hover:border-2 hover:border-[#EFB9A2] hover:bg-[#1B171A]/90 hover:text-white lg:px-8 lg:py-3">
          Buy Tickets
        </button>
      </div>
      <Separator className="my-4 bg-[#EFB9A2]" />
    </div>
  )
}

export default Event

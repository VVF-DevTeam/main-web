import React from 'react'
import Image from 'next/image'

import { Separator } from '@/components/ui/separator'
interface EventProps {
  day: string
  name: string
  location: string
  thumbnail: string
  end: string
}

const Event = ({ day, location, thumbnail, end }: EventProps) => {
  return (
    <div className="py-6">
      <div className="flex flex-col gap-y-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex-center gap-x-8 text-xl font-light md:justify-normal lg:text-2xl">
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
        <button
          className="rounded-full bg-bgColor-black px-6 py-2 transition-all duration-75 ease-out hover:border-2 hover:border-bgColor-brandLight hover:bg-bgColor-black/90 lg:px-8 lg:py-3"
          disabled={Boolean(end)}
          aria-disabled={Boolean(end)}
        >
          {Boolean(end) ? 'Sold Out' : 'Buy Tickets'}
        </button>
      </div>
      <Separator className="my-4 bg-bgColor-brandLight" />
    </div>
  )
}

export default Event

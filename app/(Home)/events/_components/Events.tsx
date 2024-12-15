import React from 'react'
import Event from './Event'
interface EventsProps {
  events: {
    id: string
    day: string
    name: string
    location: string
    thumbnail: string
  }[]
}

const Events = ({ events }: EventsProps) => {
  return (
    <div className="bg-[#620BC4] px-4 py-14 md:px-12 lg:mt-[-14vh] lg:px-20 lg:py-40 xl:mt-[-20vh]">
      <h2 className="text-3xl font-bold uppercase text-white lg:text-5xl">
        Shows
      </h2>
      <div className="flex flex-col px-12 py-8 lg:px-16 lg:py-12">
        {events.map((event) => (
          <Event key={event.id} {...event} />
        ))}
      </div>
    </div>
  )
}

export default Events

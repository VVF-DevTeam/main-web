import { Event } from '@prisma/client'
import EventCard from './EventCard'

interface EventListProps {
  events: Event[]
}

const EventList = async ({ events }: EventListProps) => {
  return (
    <div className="flex w-full flex-col gap-y-6 xl:gap-y-12 my-10 xl:mt-20">
      <h2 className="text-center text-3xl xl:text-4xl font-bold uppercase text-[#1B171A]">
        Upcoming Events
      </h2>
      <div className="mx-auto mb-5 grid grid-cols-1 gap-x-12 gap-y-8 p-6 md:grid-cols-2 md:gap-y-12 xl:grid-cols-3">
        {events.map((event) =>
          event.title !== 'Friday Chill 3' ? (
            <EventCard key={event.id} event={event} />
          ) : null
        )}
      </div>
    </div>
  )
}

export default EventList

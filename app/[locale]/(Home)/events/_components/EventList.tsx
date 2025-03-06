import { Event } from '@prisma/client'
import EventCard from './EventCard'

interface EventListProps {
  events: Event[]
}

const EventList = async ({ events }: EventListProps) => {
  return (
    <div className="flex w-full flex-col gap-y-6 xl:gap-y-12 my-10 xl:mt-20">
      <h2 className="header-main">
        Upcoming Events
      </h2>
      <div className="mx-auto mb-5 flex-col-default grid-all-cols-3 p-6 md:gap-y-12">
        {events.map((event) =>
          <EventCard key={event.id} event={event} />
        )}
      </div>
    </div>
  )
}

export default EventList

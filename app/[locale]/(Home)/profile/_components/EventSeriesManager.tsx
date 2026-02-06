// Libraries
import { EventSeries } from '@prisma/client'
import { getAllEventSeries } from '@/lib/actions/event/getEventSeries'

// Components
import SeriesManager from '@/app/[locale]/(Home)/events/(Admin)/_components/SeriesManager'

interface EventSeriesManagerProps {
  user: {
    role: string[]
  }
}

export default async function EventSeriesManager({
  user,
}: EventSeriesManagerProps) {
  // Get all event series using cached function
  let eventSeries: EventSeries[] = []
  try {
    eventSeries = await getAllEventSeries()
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      <SeriesManager eventSeries={eventSeries} />
    </div>
  )
}


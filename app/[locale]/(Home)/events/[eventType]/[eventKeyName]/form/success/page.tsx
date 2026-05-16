import EventFormSuccess from '@/components/payment/EventFormSuccess'
import { getEventTitleByKeyName } from '@/lib/actions/event/getEvent'

export const dynamic = 'force-dynamic'

interface EventFormSuccessPageProps {
  params: Promise<{ eventKeyName: string }>
}

const EventFormSuccessPage = async ({
  params,
}: EventFormSuccessPageProps) => {
  const { eventKeyName } = await params

  const publishedEvent = await getEventTitleByKeyName(eventKeyName)

  if (!publishedEvent) return null

  return <EventFormSuccess title={publishedEvent.title} />
}

export default EventFormSuccessPage

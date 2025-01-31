import EventList from './_components/EventList'

const EventsPage = () => {
  const eventList = [
    {
      id: '1',
      eventType: 'class',
      title: 'Beginner Guitar Lessons',
      description: 'asdsad',
      eventCategoryId: '1',
      thumbnail: '/bg/guitar-background.jpg',
      startDate: new Date('2025-02-10T00:00:00'),
      endDate: new Date('2025-06-10T00:00:00'),
      dates: ['Sat'],
      duration: '1.5 hours',
      capacity: 10,
      ticketsSold: 5,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: '1',
      price: 8.5,
      location: 'Metro Vancouver',
      startTime: new Date('2025-03-10T02:00:00'),
    },
    {
      id: 'elenaDance',
      eventType: 'class',
      title: ' Beginner Dance Lessons (Coming Soon)',
      description: 'asdsad',
      eventCategoryId: '1',
      thumbnail: '/bg/dance-bg.jpg',
      startDate: new Date('2025-03-10T00:00:00'),
      endDate: new Date('2025-07-10T00:00:00'),
      dates: ['Fri', 'Sun'],
      duration: '1 hour',
      capacity: 0,
      ticketsSold: 0,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: '1',
      price: 0,
      location: 'Downtown Vancouver',
      startTime: new Date('2025-03-10T15:00:00'),
    },
    {
      id: 'fridaychill',
      eventType: 'concert',
      title: 'Friday Chill 3',
      description: 'asdsad',
      eventCategoryId: '1',
      thumbnail: '/sample-images/image3.jpg',
      startDate: new Date('2024-12-13T18:00:00'),
      endDate: new Date('2024-12-13T21:00:00'),
      dates: ['Fri'],
      duration: '3 hours',
      capacity: 10,
      ticketsSold: 10,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: '1',
      price: 15,
      location: '139 Keefer Street',
      startTime: new Date('2025-03-10T01:00:00'),
    },
  ]
  return (
    <div className="w-full overflow-hidden">
      <div className="">
        <EventList events={eventList} />
      </div>
    </div>
  )
}

export default EventsPage

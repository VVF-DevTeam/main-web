import EventList from './_components/EventList'

const EventsPage = async({ params }: { params: Promise<{ locale: string }> }) => {
  const eventList = [
    {
      id: 'beginnerGuitarLesson',
      eventType: 'class',
      title: 'Beginner Guitar Lessons',
      description: 'The Basic Acoustic Guitar Class, organized by Viet Vibe Foundation (VVF), offers 90-minute weekly lessons (18:00-19:30 Thursday) from February 27th to June 5th 2025 (Performance night). Led by three experienced instructors—Michael Nguyen, Eattle Nguyen, and Eric Nguyen—the program is designed for a maximum of 12 participants, with a minimum of 5 students required.',
      eventCategoryId: '1',
      thumbnail: '/bg/guitar-background.jpg',
      startDate: new Date('2025-02-06T00:00:00'),
      endDate: new Date('2025-06-10T00:00:00'),
      dates: ['Thurs'],
      duration: '1.5 hours',
      capacity: 10,
      ticketsSold: 5,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: '1',
      price: 8.5,
      location: 'Victoria - Fraser View',
      startTime: new Date('2025-02-06T18:00:00'),
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
      startTime: new Date('2025-03-10T17:00:00'),
    },
  ]
  const { locale } = await params

  return (
    <div className="w-full overflow-hidden">
      <div className="">
        <EventList events={eventList} locale={locale} />
      </div>
    </div>
  )
}

export default EventsPage

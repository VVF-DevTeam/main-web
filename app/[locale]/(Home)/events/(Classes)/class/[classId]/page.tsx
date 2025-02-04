import ClassImage from '../_component/ClassImage'
import ClassDescription from '../_component/ClassDescription'

const eventList = [
  {
    id: '1',
    eventType: 'class',
    title: 'Beginner Guitar Lessons',
    description:
      'To provide accessible and high-quality guitar lessons to members and non-members of the Viet Vibe Foundation (VVF), fostering musical skills and community engagement.',
    eventCategoryId: '1',
    thumbnail: '/bg/guitar-background.jpg',
    startDate: new Date('2025-02-06T00:00:00'),
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
    location: 'Victoria - Fraser View',
    startTime: new Date('2025-03-10T18:00:00'),
    endTime: new Date('2025-03-10T19:30:00'),
    instructor: 'Trong Nguyen',
    schedules: [
      {
        id: 1,
        startTime: new Date('2025-03-10T18:00:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T18:30:00'),
        action: 'Practice previous lesson',
      },
      { 
        id: 2,
        startTime: new Date('2025-03-10T18:30:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T19:00:00'),
        action: 'Learn new lesson',
      },
      {
        id: 3,
        startTime: new Date('2025-03-10T19:00:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T19:30:00'),
        action: 'Play new song ',
      },
    ],
  },
]

const ClassPage = () => {
  return (
    <div className='flex flex-col gap-y-26 md:gap-y-10 lg:gap-y-0'>
      <ClassImage
        imageUrl={eventList[0].thumbnail}
        location={eventList[0].location}
        startDate={eventList[0].startDate}
        instructor={eventList[0].instructor}
        title={eventList[0].title}
      />
      <ClassDescription
        description={eventList[0].description}
        startDate={eventList[0].startDate}
        endDate={eventList[0].endDate}
        startTime={eventList[0].startTime}
        endTime={eventList[0].endTime}
        duration={eventList[0].duration}
        capacity={eventList[0].capacity}
        location={eventList[0].location}
        instructor={eventList[0].instructor}
        schedules={eventList[0].schedules}
      />
    </div>
  )
}

export default ClassPage

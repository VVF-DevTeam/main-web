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
    instructor: 'Trong Nguyen',
    schedules: [
      {
        id: 1,
        startTime: new Date('2025-03-10T02:00:00'),
        duration: '1.5 hours',
        endTime: new Date('2025-03-10T03:00:00'),
        action: 'Lesson',
      },
      { 
        id: 2,
        startTime: new Date('2025-03-10T03:00:00'),
        duration: '1.5 hours',
        endTime: new Date('2025-03-10T04:00:00'),
        action: 'Dance',
      },
      {
        id: 3,
        startTime: new Date('2025-03-10T04:00:00'),
        duration: '1.5 hours',
        endTime: new Date('2025-03-10T05:00:00'),
        action: 'Non-Musical',
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
      />
      <ClassDescription
        description={eventList[0].description}
        startDate={eventList[0].startDate}
        endDate={eventList[0].endDate}
        startTime={eventList[0].startTime}
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

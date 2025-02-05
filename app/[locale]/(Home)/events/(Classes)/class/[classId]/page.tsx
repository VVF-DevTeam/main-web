import ClassImage from '../_component/ClassImage'
import ClassDescription from '../_component/ClassDescription'
import { Metadata } from 'next';

const eventList = [
  {
    id: 'beginnerGuitarLesson',
    eventType: 'class',
    title: 'title-guitar',
    description: 'description-guitar',
    eventCategoryId: '1',
    thumbnail: '/bg/guitar-background.jpg',
    startDate: new Date('2025-02-06T00:00:00'),
    endDate: new Date('2025-06-05T00:00:00'),
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
    instructor: 'Michael Nguyen, Eattle Nguyen, and Eric Nguyen',
    schedules: [
      {
        id: 1,
        startTime: new Date('2025-03-10T18:00:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T18:30:00'),
        action: 'action1-guitar',
      },
      {
        id: 2,
        startTime: new Date('2025-03-10T18:30:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T19:00:00'),
        action: 'action2-guitar',
      },
      {
        id: 3,
        startTime: new Date('2025-03-10T19:00:00'),
        duration: '0.5 hours',
        endTime: new Date('2025-03-10T19:30:00'),
        action: 'action3-guitar',
      },
    ],
  },
]

export const metadata: Metadata ={
  title: "Beginner Guitar Lessons",
  description: "Beginner Guitar Lessons from Viet Vibe Foundation",
  openGraph: {
    title: "Beginner Guitar Lessons",
    description: "Beginner Guitar Lessons from Viet Vibe Foundation",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/11bc2377-17ca-4649-b552-4bd9243ac6e7.jpg?token=b3iCUGitQyvlmapA7oEKdwIGX78HqOKvJHILBkc6j2o&height=800&width=1200&expires=33274743245", // Update with the correct path
        width: 1200,
        height: 630,
        alt: "Someone is playing a guitar",
      },
    ],
  },
}

interface ClassPageProps {
  params: Promise<{ locale: string }>
}

const ClassPage = async ({ params }: ClassPageProps) => {
  const { locale } = await params

  return (
    <div className="gap-y-26 flex flex-col md:gap-y-10 lg:gap-y-0">
      <ClassImage
        imageUrl={eventList[0].thumbnail}
        location={eventList[0].location}
        startDate={eventList[0].startDate}
        instructor={eventList[0].instructor}
        title={eventList[0].title}
        locale={locale}
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
        locale={locale}
      />
    </div>
  )
}

export default ClassPage

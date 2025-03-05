import ClassImage from '../_component/ClassImage'
import ClassDescription from '../_component/ClassDescription'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Beginner Guitar Lessons',
  description: 'Beginner Guitar Lessons from Viet Vibe Foundation',
  openGraph: {
    title: 'Beginner Guitar Lessons',
    description: 'Beginner Guitar Lessons from Viet Vibe Foundation',
    images: [
      {
        url: 'https://opengraph.b-cdn.net/production/images/11bc2377-17ca-4649-b552-4bd9243ac6e7.jpg?token=b3iCUGitQyvlmapA7oEKdwIGX78HqOKvJHILBkc6j2o&height=800&width=1200&expires=33274743245', // Update with the correct path
        width: 1200,
        height: 630,
        alt: 'Someone is playing a guitar',
      },
    ],
  },
}

interface ClassPageProps {
  params: Promise<{ locale: string; classId: string }>
}

const ClassPage = async ({ params }: ClassPageProps) => {
  const { locale, classId } = await params

  const publishedClass = await prisma.event.findUnique({
    where: {
      id: classId,
    },
    include: {
      schedules: true,
      categories: true,
      hosts: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!publishedClass) {
    return
  }

  return (
    <div>
      <div className="gap-y-26 flex flex-col md:gap-y-10 lg:gap-y-0">
        <ClassImage
          imageUrl={publishedClass.imgUrl!}
          location={publishedClass.location!}
          startDate={publishedClass.startDate!}
          hosts={publishedClass.hosts}
          title={publishedClass.title}
          locale={locale}
        />
        <ClassDescription
          description={publishedClass.description!}
          startDate={publishedClass.startDate!}
          endDate={publishedClass.endDate}
          startTime={publishedClass.startTime!}
          endTime={publishedClass.endTime!}
          capacity={publishedClass.capacity!}
          location={publishedClass.location!}
          hosts={publishedClass.hosts}
          schedules={publishedClass.schedules}
          days={publishedClass.days!}
          locale={locale}
        />
      </div>
    </div>
  )
}

export default ClassPage

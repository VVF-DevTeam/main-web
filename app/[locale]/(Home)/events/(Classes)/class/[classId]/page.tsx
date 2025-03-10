// Components
import ClassImage from '../_component/ClassImage'
import ClassDescription from '../_component/ClassDescription'
import BackButton from '@/components/ui/back-button'

// Libraries
import { Metadata } from 'next'
import { prisma } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>
}): Promise<Metadata> {
  const { classId } = await params
  const publishedClass = await prisma.event.findUnique({
    where: {
      id: classId,
    },
    select: {
      title: true,
      imgUrl: true,
    },
  })

  return {
    title: publishedClass?.title,
    description: publishedClass?.title + ' from Viet Vibe Foundation',
    openGraph: {
      title: publishedClass?.title,
      description: publishedClass?.title + ' from Viet Vibe Foundation',
      images: {
        url: publishedClass?.imgUrl!,
        alt: publishedClass?.title,
      },
    },
  }
}

// Interfaces
interface ClassPageProps {
  params: Promise<{ locale: string; classId: string }>
}

// Main Component
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
        <BackButton />

        <ClassImage
          imageUrl={publishedClass.imgUrl!}
          location={publishedClass.location!}
          startDate={publishedClass.startDate!}
          hosts={publishedClass.hosts}
          title={publishedClass.title}
          formLink={publishedClass.formLink!}
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
          formLink={publishedClass.formLink!}
          locale={locale}
        />
      </div>
    </div>
  )
}

export default ClassPage

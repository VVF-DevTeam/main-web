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
  params: Promise<{ classKeyName: string }>
}): Promise<Metadata> {
  const { classKeyName } = await params

  // TODO: Simplify code to only query once to get data
  const publishedClass = await prisma.event.findUnique({
    where: {
      keyName: classKeyName,
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
  params: Promise<{ locale: string; classKeyName: string }>
}

// Main Component
const ClassPage = async ({ params }: ClassPageProps) => {
  const { locale, classKeyName } = await params

  const publishedClass = await prisma.event.findUnique({
    where: {
      keyName: classKeyName,
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
      <div className="width-max-default mx-auto">
        <BackButton variant={'responsive'} />
        <ClassImage
          imageUrl={publishedClass.imgUrl!}
          location={publishedClass.location!}
          startDate={publishedClass.startDate!}
          hosts={publishedClass.hosts}
          title={publishedClass.title}
          locale={locale}
        />
      </div>
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
        stripePriceId={publishedClass.stripePriceId!}
        locale={locale}
        keyName={publishedClass.keyName}
        classId={publishedClass.id}
        price={publishedClass.price?.toNumber()!}
        title={publishedClass.title}
      />
    </div>
  )
}

export default ClassPage

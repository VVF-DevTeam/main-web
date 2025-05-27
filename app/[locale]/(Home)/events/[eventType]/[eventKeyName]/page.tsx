// Components
import ClassImage from '../_component/_class/ClassImage'
import ClassDescription from '../_component/_class/ClassDescription'
import BackButton from '@/components/ui/back-button'
import ConcertDescriptions from '../_component/_concert/ConcertDescriptions'
import ConcertHeaders from '../_component/_concert/ConcertHeaders'

// Libraries
import { Metadata } from 'next'
import { prisma } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventKeyName: string }>
}): Promise<Metadata> {
  const { eventKeyName } = await params

  // TODO: Simplify code to only query once to get data
  const publishedClass = await prisma.event.findUnique({
    where: {
      keyName: eventKeyName,
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
  params: Promise<{ locale: string; eventKeyName: string }>
}

// Main Component
const ClassPage = async ({ params }: ClassPageProps) => {
  const { locale, eventKeyName } = await params
  
  const publishedClass = await prisma.event.findUnique({
    where: {
      keyName: eventKeyName,
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
    <>
      {publishedClass.eventType === 'CONCERT' ? (
        <div className="w-full overflow-hidden">
          {/* Event Headers */}
          <ConcertHeaders event={publishedClass} />
          <ConcertDescriptions event={publishedClass} locale={locale} />
        </div>
      ) : (
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
            stripeProductId={publishedClass.stripeProductId!}
            stripeSubscribedPriceId={publishedClass.subscribedPriceId!}
            locale={locale}
            keyName={publishedClass.keyName}
            classId={publishedClass.id}
            price={publishedClass.price?.toNumber()!}
            title={publishedClass.title}
            fullCourseDiscount={publishedClass.fullCourseDiscount || 0}
            eventType={publishedClass.eventType}
          />
        </div>
      )}
    </>
  )
}

export default ClassPage

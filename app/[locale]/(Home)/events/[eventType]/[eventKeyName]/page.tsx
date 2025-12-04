// Components
import ClassImage from '../_component/_class/ClassImage'
import ClassDescription from '../_component/_class/ClassDescription'
import BackButton from '@/components/ui/back-button'
import ConcertDescriptions from '../_component/_concert/ConcertDescriptions'
import ConcertHeaders from '../_component/_concert/ConcertHeaders'

// Types
import { SeatingMap } from '../../(Admin)/editEvent/[eventId]/_components/EventSeating'

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
          image: true,
        },
      },
      _count: {
        select: {
          Review: true,
        },
      },
      series: {
        select: {
          id: true,
        },
      },
      tickets: true,
      sponsors: true,
    },
  })

  if (!publishedClass) {
    return
  }

  // Check if gallery carousel should be rendered
  const shouldShowGallery = !!(
    publishedClass.imgUrls &&
    Array.isArray(publishedClass.imgUrls as string[]) &&
    (publishedClass.imgUrls as string[]).length > 0
  )

  return (
    <>
      {publishedClass.eventType === 'CONCERT' ? (
        <div className="w-full">
          {/* Event Headers */}
          <ConcertHeaders event={publishedClass} />
          <ConcertDescriptions
            event={{
              ...publishedClass,
              imgUrls: (publishedClass.imgUrls as string[]) || [],
            }}
            locale={locale}
            shouldShowGallery={shouldShowGallery as boolean}
            reviewsCount={publishedClass._count.Review}
            seriesId={publishedClass.series?.id}
            seatingMap={publishedClass.seatingMap as SeatingMap}
          />
        </div>
      ) : (
        <div>
          <div className="width-max-default relative mx-auto pt-[90px] md:pt-[120px]">
            <BackButton variant={'default'} className="top-[30px]" />
            <ClassImage
              eventId={publishedClass.id}
              hosts={publishedClass.hosts}
              title={publishedClass.title}
              locale={locale}
              socialLinks={
                publishedClass.socialLinks as
                  | { platform: string; url: string }[]
                  | null
              }
              reviewsCount={publishedClass._count.Review}
              seriesId={publishedClass.series?.id}
            />
          </div>
          <ClassDescription
            description={publishedClass.description!}
            imageUrl={publishedClass.imgUrl!}
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
            keyName={publishedClass.keyName}
            classId={publishedClass.id}
            title={publishedClass.title}
            eventType={publishedClass.eventType}
            shouldShowGallery={shouldShowGallery as boolean}
            imageUrls={publishedClass.imgUrls as string[]}
            tickets={publishedClass.tickets}
            sponsors={publishedClass.sponsors}
          />
        </div>
      )}
    </>
  )
}

export default ClassPage

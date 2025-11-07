// Libraries
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import Link from 'next/link'

// Components
import PublishButton from '@/app/[locale]/components/PublishButton'
import EventStartDate from './_components/EventStartDate'
import EventTitle from './_components/EventTitle'
import EventEndDate from './_components/EventEndDate'
import EventTimings from './_components/EventTimings'
import EventSchedule from './_components/EventSchedule'
import EventCategories from './_components/EventCategories'
import EventDays from './_components/EventDays'
import EventImage from './_components/EventImage'
import EventPrice from './_components/EventPrice'
import EventLocation from './_components/EventLocation'
import EventType from './_components/EventType'
import EventHosts from './_components/EventHosts'
import EventDescription from './_components/EventDescription'
import EventCapacity from './_components/EventCapacity'
import EventFullDiscount from './_components/EventFullDiscount'
import BackButton from '@/components/ui/back-button'
import ImageAddInstruction from '@/components/instruction/ImageAddInstruction'
import EditorInstructions from '@/components/instruction/EditorInstructions'
import EventFormLink from './_components/EventFormLink'
import EventSocialMedia from './_components/EventSocialMedia'
import EventSubtitle from './_components/EventSubtitle'
import EventGallery from './_components/EventGallery'

// Main Component
const EditEventPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>
}) => {
  // check if the current user is an admin or host to allow access to the post control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' }))
  ) {
    return redirect('/events')
  }

  const { eventId } = await params

  // Fetch the Event data
  const event = await prisma.event.findUnique({
    where: {
      keyName: eventId,
    },
    include: {
      schedules: {
        orderBy: {
          position: 'asc',
        },
      },
      categories: true,
      hosts: {
        select: {
          name: true,
          role: true,
          id: true,
        },
      },
    },
  })

  // Fetch event categories
  const categories = await prisma.eventCategory.findMany()
  // TODO: If the event is not found, show a 404 page.
  if (!event) {
    redirect('/events')
  }

  const eventFields = [
    !!event.title,
    !!event.eventType,
    !!event.description,
    !!event.price,
    !!event.capacity,
    !!event.location,
    !!event.imgUrl,
    !!event.startTime && !!event.endTime,
    !!event.startDate,
    !!event.endDate,
    // !!event.formLink,
    event.hosts.length === 0 ? false : true,
    event.days.length === 0 ? false : true,
    event.schedules.length === 0 ? false : true,
    event.categories.length === 0 ? false : true,
  ]

  const completedFields = eventFields.filter(Boolean).length
  const completionText = `(${completedFields} / ${eventFields.length})`
  const canPublish = completedFields === eventFields.length

  return (
    <div className="my-12 p-6 lg:my-20">
      {/* Back Button To Parent Page */}
      <BackButton />

      <div className="mx-auto my-20 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl xl:text-5xl">
              Edit Event
            </h1>
            <span className="text-sm text-muted-foreground">
              Fill all the fields to publish your event.
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Please complete the first 14 steps, the rest are optional.
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Required steps completed: {completionText}
            </span>
          </div>

          {/* Publish Button */}
          <PublishButton
            id={event.id}
            type={'event'}
            canPublish={canPublish}
            isPublished={event.isPublished}
            domain={'events'}
          />
        </div>

        {/* Event Body */}
        <div className="mt-20 grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:gap-x-8">
          {/* Title */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step I :</span> Title
            </h2>
            <EventTitle event={event} />
            {event.eventType === 'CONCERT' && <EventSubtitle event={event} />}
          </div>
          {/* Type */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step II :</span> Type
            </h2>
            <EventType event={event} />
          </div>
          {/* Description */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step III :</span> Description
            </h2>
            <EditorInstructions />
            <EventDescription event={event} />
          </div>
          {/* Price */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step IV :</span> Price
            </h2>
            <EventPrice event={event} />
          </div>
          {/* Capacity */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step V :</span> Capacity
            </h2>
            <EventCapacity event={event} />
          </div>
          {/* Location */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VI :</span> Location
            </h2>
            <EventLocation event={event} />
          </div>
          {/* Images */}
          <div className="col-span-full flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VII :</span> Image
            </h2>
            <ImageAddInstruction />
            <EventImage event={event} />
          </div>
          {/* Start Date */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VIII :</span> Start Date
            </h2>
            <EventStartDate event={event} />
          </div>
          {/* End date */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step IX :</span> End Date
            </h2>
            <EventEndDate event={event} />
          </div>
          {/* Event Timings */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step X :</span> Event Timings
            </h2>
            <EventTimings event={event} />
          </div>
          {/* Event Days */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XI :</span> Event Days
            </h2>
            <EventDays event={event} />
          </div>
          {/* End Schedule */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XII :</span> Event Schedule
            </h2>
            <EventSchedule event={event} />
          </div>
          {/* Event Hosts */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XIII :</span> Event Hosts
            </h2>
            <EventHosts event={event} />
          </div>
          {/* Event Categories */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XIV :</span> Event Categories
            </h2>
            <p>
              {' '}
              To add categories, please click{' '}
              <Link
                href="/events/createEventCategory"
                target="_blank"
                className="text-textColor-blue underline"
              >
                here
              </Link>
              . After adding, please refresh the page.
            </p>
            <EventCategories event={event} categories={categories} />
          </div>
          {/* Event Registration Form Link */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XV :</span> Event
              Registration Form (Optional)
            </h2>
            <p>
              Please note that if you use your own registration form, the Stripe
              payment section will be replaced. Make sure to include your own
              payment options in the form. (E-transfer option will still be
              available)
            </p>
            <EventFormLink event={event} />
          </div>
          {/* Event Social Media - Only show for concert events */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XVI :</span> Social Media
              Links (Optional)
            </h2>
            <EventSocialMedia event={event} />
          </div>
          {/* Event Full Discount */}
          {event.eventType === 'CLASS' && (
            <div className="flex flex-col gap-y-8">
              <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
                <span className="text-gray-500">Step XVII :</span> Full Course
                Discount (Optional)
              </h2>
              <EventFullDiscount event={event} />
            </div>
          )}
          {/* Event Gallery */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step XVIII :</span> Event Gallery
              (Optional)
            </h2>
            <EventGallery event={event} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditEventPage

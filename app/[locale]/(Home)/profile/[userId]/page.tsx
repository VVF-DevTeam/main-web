// Libraries
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { prisma } from '@/lib/db'
import { getAllPublishedEvents } from '@/lib/actions/event/getEvent'

// Components
import MyProfile from './_components/MyProfile'
import UpdateProfileForm from './_components/UpdateProfileForm'
import PasswordForm from './_components/PasswordForm'
import DeleteForm from './_components/DeleteForm'
import SubscriptionInfo from './_components/SubscriptionInfo'
import PaymentManagement from './_components/PaymentManagement'
import PrivacyPolicy from '../../_components/_policy/PrivacyPolicy'
import EmailComposition from './_components/EmailComposition'
import EventManagement from './_components/EventManagement'
import CreateEventForm from './_components/CreateEventForm'
import EventCategoryManager from './_components/EventCategoryManager'
import EventSeriesManager from './_components/EventSeriesManager'
import SponsorsManagement from './_components/SponsorsManagement'
import EditEvent from './_components/EditEvent'
import EventStatistics from './_components/EventStatistics'

// Helper to fetch payment history
const getPaymentHistory = (userId: string) =>
  prisma.payment.findMany({
    where: { userId },
    select: {
      id: true,
      pricePaid: true,
      createdAt: true,
      expiresAt: true,
      type: true,
      quantity: true,
      refunded: true,
      seatNumber: true,
      event: {
        select: {
          id: true,
          title: true,
          keyName: true,
          imgUrl: true,
          startDate: true,
          endDate: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

// Helper to fetch published events
const getPublishedEvents = async () => {
  return await getAllPublishedEvents({
    id: true,
    title: true,
    keyName: true,
    eventType: true,
    startDate: true,
    endDate: true,
    location: true,
    imgUrl: true,
    price: true,
  })
}

// Main Component
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    section?: string
    page?: string
    pageSize?: string
    eventId?: string
  }>
}) {
  const [
    { section, page: pageStr, pageSize: pageSizeStr, eventId },
    { locale },
    user,
  ] = await Promise.all([searchParams, params, getCurrentUserInfo()])

  // Return if user is not logged in
  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

  // Switch component based on searchParams
  // Only fetch data that's needed for each section
  switch (section) {
    case 'update-profile':
      return <UpdateProfileForm user={user} />

    case 'change-password':
      return <PasswordForm user={user} />

    case 'delete-account':
      return <DeleteForm user={user} />

    case 'subscription': {
      const paymentHistory = await getPaymentHistory(user.id)
      return <SubscriptionInfo paymentHistory={paymentHistory} user={user} />
    }

    case 'admin-payment-management':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        const page = Math.max(1, Number.parseInt(pageStr || '1', 10) || 1)
        const pageSize = [10, 20, 50].includes(Number(pageSizeStr))
          ? Number(pageSizeStr)
          : 20
        return <PaymentManagement user={user} page={page} pageSize={pageSize} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-email-composition':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        return <EmailComposition user={user} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'privacy-policy':
      return <PrivacyPolicy locale={locale} />

    case 'admin-all-events':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        return <EventManagement user={user} locale={locale} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-create-event':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        return <CreateEventForm user={user} locale={locale} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-event-categories':
      if (user.role && user.role.includes('ADMIN')) {
        return <EventCategoryManager user={user} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-event-series':
      if (user.role && user.role.includes('ADMIN')) {
        return <EventSeriesManager user={user} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-manage-sponsors':
      if (user.role && user.role.includes('ADMIN')) {
        return <SponsorsManagement user={user} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-event-statistics':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        return <EventStatistics user={user} locale={locale} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    case 'admin-edit-event':
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        if (!eventId) {
          return (
            <p className="mt-10 text-center">
              Event ID is required to edit an event.
            </p>
          )
        }
        return <EditEvent eventId={eventId} user={user} locale={locale} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )

    default: {
      // Only fetch events and payment history for the default profile view
      const [eventList, paymentHistory] = await Promise.all([
        getPublishedEvents(),
        getPaymentHistory(user.id),
      ])
      return (
        <MyProfile
          user={user}
          locale={locale}
          upcoming_events={eventList}
          paymentHistory={paymentHistory}
        />
      )
    }
  }
}

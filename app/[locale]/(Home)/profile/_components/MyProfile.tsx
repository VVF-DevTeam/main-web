import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiShoppingCart } from 'react-icons/fi'

import { RiCalendarEventFill } from 'react-icons/ri'

import initTranslation from '@/app/i18n'
import Image from 'next/image'
import Link from 'next/link'
import { Event, PaymentType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  getPaymentStatus,
  getStatusColor,
} from '@/lib/actions/payment/paymentStatus'
import SmsOtpVerificationPopover from './SmsOtpVerificationPopover'
import ResendVerificationEmailButton from './ResendVerificationEmailButton'
import { UserInfoProps } from '@/lib/types/userInfo'
import { auth } from '@/auth'

type PaymentHistoryItem = {
  id: string
  pricePaid: Decimal
  createdAt: Date
  type: PaymentType
  expiresAt: Date | null
  quantity: number
  refunded: boolean
  seatNumber: string | null
  event: {
    title: string
    keyName: string
    startDate: Date | null
    endDate: Date
    location: string | null
  } | null
  shopItem: {
    title: string
  } | null
  shop: {
    title: string
    slug: string | null
  } | null
}

const paymentTypeMap = {
  Membership: 'Membership',
  Class: 'Class',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
  Camping: 'Camping',
  Event: 'Event',
  Shop: 'Shop',
}

const MyProfile = async ({
  user,
  locale,
  // events,
  upcoming_events,
  paymentHistory,
}: {
  user: UserInfoProps
  locale: string
  // events: Event[]
  upcoming_events: Event[]
  paymentHistory: PaymentHistoryItem[]
}) => {
  const { t } = await initTranslation(locale, ['profile'])
  const session = await auth()
  const eduEmailExpiredDate = session?.user?.eduEmailExpiredDate
    ? new Date(session.user.eduEmailExpiredDate)
    : null
  const hasActiveStudentStatus =
    !!eduEmailExpiredDate && !Number.isNaN(eduEmailExpiredDate.getTime()) && eduEmailExpiredDate > new Date()
  const displayRoles = Array.from(
    new Set([
      ...(user.role || []).filter((role) => role !== 'USER'),
      ...(hasActiveStudentStatus ? ['STUDENT'] : []),
    ])
  )

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('my-profile')}</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-8 md:pb-5 lg:grid-cols-4">
          {/* Profile Section */}
          <div className="relative col-span-1 flex flex-col items-center justify-center rounded-lg bg-bgColor-white p-6 shadow-lg lg:items-stretch lg:justify-normal">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brand900"></div>
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-bgColor-gray500">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FiUser className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  {user.name || 'Unnamed User'}
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <FiMail className="flex-shrink-0 text-xl text-textColor-gray500" />
                  <span className="flex-1 break-words lg:w-0">{user.email}</span>
                </div>
                {user && !user.emailVerifiedDate && (
                  <div className="ml-8">
                    <ResendVerificationEmailButton email={user.email} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <FiPhone className="flex-shrink-0 text-xl text-textColor-gray500" />
                  <span className="flex-1 break-words lg:w-0">
                    {user.phone || 'N/A'}
                  </span>
                </div>
                {user.phone && !user.phoneVerified && (
                  <div className="ml-8">
                    <SmsOtpVerificationPopover
                      phoneNumber={user.phone}
                      userId={user.id}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="flex-shrink-0 text-xl text-textColor-gray500" />
                <span className="flex-1 break-words lg:w-0">
                  {user.address || 'N/A'}
                </span>
              </div>

              {displayRoles.length > 0 && (
                  <div
                    className="rounded-lg border border-bgColor-brand900/15 bg-bgColor-brand100/40 p-3 shadow-sm"
                    role="region"
                    aria-label={String(t('roles-section'))}
                  >
                    <div className="mb-2 flex items-center gap-2 border-b border-bgColor-brand900/10 pb-2">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bgColor-brand900/10 text-bgColor-brand900">
                        <FiUser className="text-lg" aria-hidden />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-bgColor-brand900">
                        {t('roles-section')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {displayRoles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex w-full items-center justify-center rounded-full border border-bgColor-brand900/20 bg-bgColor-white px-1 py-0.5 text-[11px] font-medium text-bgColor-brand900 shadow-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Event Order History Section */}
          <div className="relative col-span-1 flex h-full flex-col rounded-lg bg-bgColor-white p-6 shadow-lg lg:col-span-3">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brand900"></div>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <RiCalendarEventFill />
              {t('event-order-history')}
            </h3>

            <div className="flex max-h-96 flex-grow flex-col overflow-hidden rounded-md border">
              <div className="flex-grow overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-bgColor-brand100 shadow-md">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-center">{t('title')}</th>
                      <th className="px-4 py-3 text-center">
                        {t('start-date')}
                      </th>
                      <th className="px-4 py-3 text-center">{t('end-date')}</th>
                      <th className="px-4 py-3 text-center">{t('location')}</th>
                      <th className="px-4 py-3 text-center">{t('price')}</th>
                      <th className="px-4 py-3 text-center">
                        {t('quantity')}/{t('seatNumber')}
                      </th>
                      <th className="px-4 py-3 text-center">{t('type')}</th>
                      <th className="px-4 py-3 text-center">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentHistory.some((p) => p.type !== 'Shop') ? (
                      paymentHistory.map(
                        (payment: PaymentHistoryItem, index: number) => {
                          if (payment.type !== 'Shop') {
                            // payment details
                            const event = payment.event
                            const startDate = new Date(
                              payment.type === 'Membership'
                                ? payment.createdAt
                                : event!.startDate!
                            )
                            const endDate = new Date(
                              payment.type === 'Membership'
                                ? payment!.expiresAt!
                                : event!.endDate
                            )
                            const status = getPaymentStatus(payment)
                            const statusColor = getStatusColor(status)
                            return (
                              <tr
                                key={index}
                                className="cursor-pointer border-b bg-bgColor-white"
                              >
                                <td className="px-4 py-3 text-center text-textColor-blue hover:underline">
                                  {payment.type === 'Membership' ? (
                                    <Link
                                      href={`/profile?section=subscription`}
                                    >
                                      Membership
                                    </Link>
                                  ) : (
                                    <Link
                                      href={`/events/class/${event!.keyName}`}
                                    >
                                      {event!.title}
                                    </Link>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {startDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {endDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {payment.type === 'Membership'
                                    ? '-'
                                    : event!.location!}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  ${Number(payment.pricePaid).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {payment.quantity}/{payment.seatNumber || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {paymentTypeMap[payment.type]}
                                </td>
                                <td
                                  className={`px-4 py-3 font-medium ${statusColor} text-center`}
                                >
                                  {status}
                                </td>
                              </tr>
                            )
                          }
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-textColor-gray/50 px-4 py-3 text-center"
                        >
                          {t('no-event')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Order History Section */}
        <div className="relative mb-8 rounded-lg bg-bgColor-white p-6 shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brand900"></div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <FiShoppingCart />
            {t('shop-order-history')}
          </h3>

          <div className="flex max-h-96 flex-grow flex-col overflow-hidden rounded-md border">
            <div className="flex-grow overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-bgColor-brand100 shadow-md">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-center">{t('title')}</th>
                    <th className="px-4 py-3 text-center">{t('date')}</th>
                    <th className="px-4 py-3 text-center">{t('price')}</th>
                    <th className="px-4 py-3 text-center">{t('quantity')}</th>
                    <th className="px-4 py-3 text-center">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paymentHistory.some((p) => p.type === 'Shop') ? (
                    paymentHistory
                      .filter((payment) => payment.type === 'Shop')
                      .map((payment: PaymentHistoryItem, index: number) => {
                        const shopSlugOrTitle = payment.shop?.slug || payment.shop?.title
                        const shopLink = shopSlugOrTitle
                          ? `/shop?shopSlug=${encodeURIComponent(shopSlugOrTitle)}`
                          : '/shop'
                        return (
                          <tr
                            key={index}
                            className="border-b bg-bgColor-white"
                          >
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">
                                  {payment.shopItem?.title || '-'}
                                </span>
                                {payment.shop && (
                                  <Link
                                    href={shopLink}
                                    className="text-sm text-textColor-blue hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {payment.shop.title}
                                  </Link>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              ${Number(payment.pricePaid).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {payment.quantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {payment.refunded ? (
                                <span className="font-medium text-red-500">Refunded</span>
                              ) : (
                                <span className="font-medium text-green-600">Paid</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-textColor-gray/50 px-4 py-3 text-center"
                      >
                        {t('no-shop-order')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="relative mb-8 rounded-lg bg-bgColor-white p-6 shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brand900"></div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <FiHeart />
            {t('upcoming-event')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {upcoming_events.slice(0, 4).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.eventType.toLowerCase()}/${event.keyName}`}
                className="text-center text-textColor-white"
              >
                <div className="group relative overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
                  <Image
                    src={event.imgUrl!}
                    alt={event.title}
                    width={140}
                    height={140}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-100">
                    <div className="p-4 text-center text-textColor-white">
                      {event.title}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* See More card */}
            <Link href="/events" className="text-center text-textColor-white">
              <div className="group relative overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
                <Image
                  src="https://drive.google.com/thumbnail?id=1rq8yi8jxSDNPSkzUoh4__dsuCrhz1DnR"
                  alt="View all events"
                  width={140}
                  height={140}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-100">
                  <div className="p-4 text-center text-textColor-white font-semibold">
                    {t('view-all-events')} →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile

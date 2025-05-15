import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi'

import { RiCalendarEventFill } from 'react-icons/ri'

import initTranslation from '@/app/i18n'
import Image from 'next/image'
import Link from 'next/link'
import { Event, PaymentType } from '@prisma/client'
import { getEventStatus } from '@/lib/actions/event/getEventStatus'
import { Decimal } from '@prisma/client/runtime/library'
interface UserInfoProps {
  name: string
  email: string
  phone?: string
  address?: string
  age?: string
  image?: string
}

interface PaymentHistoryItem {
  id: string
  pricePaid: Decimal
  createdAt: Date
  type: PaymentType
  expiresAt?: Date | null
  quantity: number
  event: {
    id: string
    title: string
    keyName: string
    imgUrl: string | null
    startDate: Date | null
    endDate: Date
    location: string | null
  } | null
}

const paymentTypeMap = {
  Membership: 'Membership',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('my-profile')}</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-8 md:pb-5 lg:grid-cols-4">
          {/* Profile Section */}
          <div className="bg-bgColor-white relative col-span-1 flex flex-col rounded-lg p-6 shadow-lg justify-center items-center lg:justify-normal lg:items-stretch">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brandLight"></div>
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-bgColor-gray/20">
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
              <div className="flex items-center gap-3">
                <FiMail className="flex-shrink-0 text-xl text-textColor-gray" />
                <span className="lg:w-0 flex-1 break-words">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="flex-shrink-0 text-xl text-textColor-gray" />
                <span className="lg:w-0 flex-1 break-words">
                  {user.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="flex-shrink-0 text-xl text-textColor-gray" />
                <span className="lg:w-0 flex-1 break-words">
                  {user.address || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div className="bg-bgColor-white relative col-span-1 flex h-full flex-col rounded-lg p-6 shadow-lg lg:col-span-3">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brandLight"></div>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <RiCalendarEventFill />
              {t('order-history')}
            </h3>

            <div className="flex max-h-64 flex-grow flex-col overflow-hidden rounded-md border">
              <div className="flex-grow overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-bgColor-brandLighter shadow-md">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-center">{t('title')}</th>
                      <th className="px-4 py-3 text-center">
                        {t('start-date')}
                      </th>
                      <th className="px-4 py-3 text-center">{t('end-date')}</th>
                      <th className="px-4 py-3 text-center">{t('location')}</th>
                      <th className="px-4 py-3 text-center">{t('price')}</th>
                      <th className="px-4 py-3 text-center">{t('quantity')}</th>
                      <th className="px-4 py-3 text-center">{t('type')}</th>
                      <th className="px-4 py-3 text-center">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map(
                        (payment: PaymentHistoryItem, index: number) => {
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
                          const status =
                            payment.type === 'Membership'
                              ? getEventStatus(
                                  payment.createdAt,
                                  payment!.expiresAt!
                                )
                              : getEventStatus(startDate, endDate)
                          return (
                            <tr
                              key={index}
                              className="bg-bgColor-white cursor-pointer border-b"
                            >
                              <td className="px-4 py-3 text-center text-textColor-blue hover:underline">
                                {payment.type === 'Membership' ? (
                                  <Link href={`/profile/${user.name}?section=subscription`}>
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
                                {startDate.toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {endDate.toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {payment.type === 'Membership'
                                  ? '-'
                                  : event!.location!}
                              </td>
                              <td className="px-4 py-3 text-center">
                                ${payment.pricePaid.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {payment.quantity}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {paymentTypeMap[payment.type]}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`rounded-full px-2 py-1 text-sm ${
                                    status === 'Upcoming'
                                      ? 'bg-bgColor-blue/20 text-textColor-blue'
                                      : status === 'Ongoing'
                                        ? 'bg-bgColor-green/20 text-textColor-green'
                                        : 'bg-bgColor-yellow/20 text-textColor-yellow'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          )
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-3 text-center text-textColor-gray/50"
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

        {/* Wishlist Section */}
        <div className="bg-bgColor-white relative mb-8 rounded-lg p-6 shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brandLight"></div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <FiHeart />
            {t('upcoming-event')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {upcoming_events.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl"
              >
                <Image
                  src={item.imgUrl!}
                  alt={item.title}
                  width={140}
                  height={140}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="p-4 text-center text-textColor-white">
                    <Link
                      href={`/events/class/${item.id}`}
                      className="p-4 text-center text-textColor-white"
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile

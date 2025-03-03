'use client'

import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi'

import { RiCalendarEventFill } from 'react-icons/ri'

import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import Link from 'next/link'
import { Event } from '@prisma/client'

interface UserInfoProps {
  name: string
  email: string
  phone?: string
  address?: string
  age?: string
  image?: string
}
const getEventStatus = (
  startDate: Date,
  endDate: Date
): 'Upcoming' | 'Ongoing' | 'Finished' => {
  const today = new Date()

  if (today < startDate) return 'Upcoming'
  if (today >= startDate && today <= endDate) return 'Ongoing'
  return 'Finished'
}

const MyProfile = ({
  user,
  events,
  upcoming_events,
}: {
  user: UserInfoProps
  events: Event[]
  upcoming_events: Event[]
}) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('my-profile')}</h1>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
                <FiMail className="text-gray-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-500" />
                <span>{user.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-gray-500" />
                <span>{user.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <RiCalendarEventFill />
              {t('event-history')}
            </h3>
            <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-4 py-3 text-left">{t('title')}</th>
                    <th className="px-4 py-3 text-left">{t('start-date')}</th>
                    <th className="px-4 py-3 text-left">{t('end-date')}</th>
                    <th className="px-4 py-3 text-left">{t('dates')}</th>
                    <th className="px-4 py-3 text-left">{t('duration')}</th>
                    <th className="px-4 py-3 text-left">{t('price')}</th>
                    <th className="px-4 py-3 text-left">{t('location')}</th>
                    <th className="px-4 py-3 text-left">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.length > 0 ? (
                    events.map((event, index) => {
                      const status = getEventStatus(
                        event.startDate,
                        event.endDate
                      )
                      return (
                        <tr
                          key={index}
                          className="cursor-pointer border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/events/class/${event.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {event.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(event.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(event.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {event.dates.join(', ')}
                          </td>
                          <td className="px-4 py-3">{event.duration}</td>
                          <td className="px-4 py-3">
                            ${event.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">{event.location}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-sm ${
                                status === 'Upcoming'
                                  ? 'bg-blue-100 text-blue-800'
                                  : status === 'Ongoing'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-3 text-center text-gray-500"
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

        {/* Wishlist Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
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
                  src={item.thumbnail!}
                  alt={item.title}
                  width={140}
                  height={140}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="p-4 text-center text-white">
                    <Link
                      href={`/events/class/${item.id}`}
                      className="p-4 text-center text-white"
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

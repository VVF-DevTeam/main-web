'use client'

import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
} from 'react-icons/fi'
import Image from 'next/image'

import { useTranslation } from 'react-i18next'

interface UserInfoProps {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
}

interface Event {
  title: string
  location: string
  date: string
  price: number
  status: 'Upcoming' | 'Ongoing' | 'Finished'
}

const MyProfile = ({
  user,
  events,
}: {
  user: UserInfoProps
  events: Event[]
}) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('my-profile')}</h1>
        </div>

        {/* Profile Section */}
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Personal Info */}
          <div className="col-span-1 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {user?.image ? (
                    <Image
                      src={user?.image}
                      alt="Profile"
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
                  {user.name}
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

          {/* Event History */}
          <div className="col-span-2 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FiShoppingBag />
              {t('event-history')}
            </h3>

            {/* Table Wrapper with Fixed Height & Scroll */}
            <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-4 py-3 text-left">{t('title')}</th>
                    <th className="px-4 py-3 text-left">{t('location')}</th>
                    <th className="px-4 py-3 text-left">{t('date')}</th>
                    <th className="px-4 py-3 text-left">{t('price')}</th>
                    <th className="px-4 py-3 text-left">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <tr
                        key={index}
                        className="cursor-pointer border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3">{event.title}</td>
                        <td className="px-4 py-3">{event.location}</td>
                        <td className="px-4 py-3">{event.date}</td>
                        <td className="px-4 py-3">${event.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-sm ${
                              event.status === 'Upcoming'
                                ? 'bg-blue-100 text-blue-800'
                                : event.status === 'Ongoing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
      </div>
    </div>
  )
}

export default MyProfile

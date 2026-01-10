'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import MobileSidebar from './MobileSidebar' // Import the new component

interface SidebarProps {
  locale: string
  userId: string
  user: {
    role: string[]
  }
}

export default function Sidebar({ locale, userId, user }: SidebarProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'my-profile'

  const sections = {
    'my-profile': t('my-profile'),
    subscription: t('subscription'),
    'update-profile': t('update-profile'),
    'change-password': t('change-password'),
    'delete-account': t('delete-account'),
    'admin-payment-management': t('payment-management'),
    'admin-email-composition': t('email-composition'),
    'admin-event-statistics': 'Event Manager',
    'privacy-policy': t('privacy-policy'),
  }

  const isAdmin = user.role.includes('ADMIN')
  const isHost = user.role.includes('HOST')
  const isAdminOrHost = isAdmin || isHost
  const adminSections = [
    { key: 'admin-event-statistics', label: 'Event Manager' },
    { key: 'admin-payment-management', label: t('payment-management') },
    { key: 'admin-email-composition', label: t('email-composition') },
  ]

  const eventManagementSections = [
    'admin-create-event',
    'admin-all-events',
    'admin-event-categories',
    'admin-event-series',
    'admin-manage-sponsors',
    'admin-edit-event',
  ]
  const [isEventsDropdownOpen, setIsEventsDropdownOpen] = useState(
    eventManagementSections.includes(currentSection)
  )

  const jobManagementSections = [
    'admin-create-job',
    'admin-all-jobs',
    'admin-edit-job',
  ]
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(
    jobManagementSections.includes(currentSection)
  )

  return (
    <div className="relative w-full bg-bgColor-gray100 p-4 md:w-64 md:p-6">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <h2 className="text-textColor-black mb-4 text-xl font-semibold">
          {t('acc-setting')}
        </h2>

        <ul className="space-y-4">
          {Object.entries(sections).map(([key, label]) => {
            if (key.includes('admin')) return null
            return (
              <li key={key}>
                <Link
                  href={`/${locale}/profile/${userId}?section=${key}`}
                  className={`block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors ${
                    currentSection === key
                      ? 'text-textColor-black bg-white font-medium shadow-sm'
                      : 'text-textColor-black hover:bg-bgColor-white'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {isAdminOrHost && (
          <>
            <div className="my-6 border-b border-bgColor-black"/>
            <h2 className="text-textColor-black mb-4 text-xl font-semibold">
              Admin Section
            </h2>
            <ul className="space-y-4">
              {isAdmin && adminSections.map(({ key, label }) => (
                <li key={key}>
                  <Link
                    href={`/${locale}/profile/${userId}?section=${key}`}
                    className={`block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors ${
                      currentSection === key
                        ? 'text-textColor-black bg-white font-medium shadow-sm'
                        : 'text-textColor-black hover:bg-bgColor-white'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              
              {/* Manage Events Dropdown */}
              <li>
                <button
                  onClick={() => setIsEventsDropdownOpen(!isEventsDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-lg transition-colors text-textColor-black hover:bg-bgColor-white"
                >
                  <span>Manage Events</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isEventsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isEventsDropdownOpen && (
                  <ul className="mt-2 space-y-2 pl-4">
                    <li>
                      <Link
                        href={`/${locale}/profile/${userId}?section=admin-create-event`}
                        className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                          currentSection === 'admin-create-event'
                            ? 'text-textColor-black bg-white font-medium shadow-sm'
                            : 'text-textColor-black hover:bg-bgColor-white'
                        }`}
                      >
                        Create Event
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/${locale}/profile/${userId}?section=admin-all-events`}
                        className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                          currentSection === 'admin-all-events'
                            ? 'text-textColor-black bg-white font-medium shadow-sm'
                            : 'text-textColor-black hover:bg-bgColor-white'
                        }`}
                      >
                        View All Events
                      </Link>
                    </li>
                    {isAdmin && (
                      <>
                        <li>
                          <Link
                            href={`/${locale}/profile/${userId}?section=admin-event-categories`}
                            className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                              currentSection === 'admin-event-categories'
                                ? 'text-textColor-black bg-white font-medium shadow-sm'
                                : 'text-textColor-black hover:bg-bgColor-white'
                            }`}
                          >
                            Create & Edit Tags
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${locale}/profile/${userId}?section=admin-event-series`}
                            className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                              currentSection === 'admin-event-series'
                                ? 'text-textColor-black bg-white font-medium shadow-sm'
                                : 'text-textColor-black hover:bg-bgColor-white'
                            }`}
                          >
                            Create & Edit Series
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${locale}/profile/${userId}?section=admin-manage-sponsors`}
                            className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                              currentSection === 'admin-manage-sponsors'
                                ? 'text-textColor-black bg-white font-medium shadow-sm'
                                : 'text-textColor-black hover:bg-bgColor-white'
                            }`}
                          >
                            Manage Sponsors
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                )}
              </li>

              {/* Manage Jobs Dropdown */}
              {isAdmin && (
                <li>
                  <button
                    onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-lg transition-colors text-textColor-black hover:bg-bgColor-white"
                  >
                    <span>Manage Jobs</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isJobsDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isJobsDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4">
                      <li>
                        <Link
                          href={`/${locale}/profile/${userId}?section=admin-create-job`}
                          className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                            currentSection === 'admin-create-job'
                              ? 'text-textColor-black bg-white font-medium shadow-sm'
                              : 'text-textColor-black hover:bg-bgColor-white'
                          }`}
                        >
                          Create Job
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/${locale}/profile/${userId}?section=admin-all-jobs`}
                          className={`block w-full rounded-lg px-4 py-2 text-left text-base transition-colors ${
                            currentSection === 'admin-all-jobs'
                              ? 'text-textColor-black bg-white font-medium shadow-sm'
                              : 'text-textColor-black hover:bg-bgColor-white'
                          }`}
                        >
                          View All Jobs
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileSidebar locale={locale} userId={userId} sections={sections} user={user} />
    </div>
  )
}

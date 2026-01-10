'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'

export default function MobileSidebar({
  locale,
  userId,
  sections,
  user,
}: {
  locale: string
  userId: string
  sections: { [key: string]: string }
  user?: {
    role: string[]
  }
}) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'my-profile'

  const [isOpen, setIsOpen] = useState(false)
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
  const isAdmin = user?.role?.includes('ADMIN') ?? false
  const isHost = user?.role?.includes('HOST') ?? false
  const isAdminOrHost = isAdmin || isHost

  return (
    <div className="block md:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-textColor-black flex w-full items-center justify-between text-lg font-semibold"
        aria-label="Toggle Sidebar"
      >
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <span>{t('acc-setting')}</span>
        </div>
        <ChevronDown
          className={`text-textColor-black h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation() // Prevents click from propagating to button
            setIsOpen(!isOpen)
          }}
        />
      </button>

      {/* Sidebar Menu */}
      {isOpen && (
        <div className="mt-2 rounded-lg bg-bgColor-gray300 p-4 shadow-md">
          <ul className="space-y-4">
            {Object.entries(sections).map(([key, label]) => {
              if (key.includes('admin')) return null
              return (
                <li key={key}>
                  <Link
                    href={`/${locale}/profile/${userId}?section=${key}`}
                    className="text-textColor-black hover:bg-bgColor-white block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors"
                    onClick={() => setIsOpen(false)} // Close menu on link click
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {isAdminOrHost && (
            <>
              <Separator className="my-6" />
              <h2 className="text-textColor-black mb-4 text-xl font-semibold">
                Admin Section
              </h2>
              <ul className="space-y-4">
                {isAdmin &&
                  Object.entries(sections)
                    .filter(([key]) => key.includes('admin'))
                    .map(([key, label]) => (
                      <li key={key}>
                        <Link
                          href={`/${locale}/profile/${userId}?section=${key}`}
                          className={`block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors ${
                            currentSection === key
                              ? 'text-textColor-black bg-white font-medium shadow-sm'
                              : 'text-textColor-black hover:bg-bgColor-white'
                          }`}
                          onClick={() => setIsOpen(false)}
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
                          onClick={() => setIsOpen(false)}
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
                          onClick={() => setIsOpen(false)}
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
                              onClick={() => setIsOpen(false)}
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
                              onClick={() => setIsOpen(false)}
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
                              onClick={() => setIsOpen(false)}
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
                            onClick={() => setIsOpen(false)}
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
                            onClick={() => setIsOpen(false)}
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
      )}
    </div>
  )
}

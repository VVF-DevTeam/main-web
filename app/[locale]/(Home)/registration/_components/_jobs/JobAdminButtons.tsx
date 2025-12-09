'use client'

// Libraries
import { useSession } from 'next-auth/react'

// Components
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Main Component
const JobAdminButtons = () => {
  const { data: session, status } = useSession()

  // Don't render anything while loading or if not authenticated
  if (status === 'loading') return null

  const userRole = session?.user?.role
  const isAdmin = userRole?.includes('ADMIN')

  // Only show buttons for admin users
  if (!isAdmin) return null

  return (
    <div className="flex-col-end my-6 gap-x-4 gap-y-3 px-6 md:flex-row flex-end-md">
      {/* Create Job */}
      <Link href={'/registration/jobs/createJob'}>
        <Button variant={'default'} size={'lg'}>
          Create Job
        </Button>
      </Link>
      {/* View All Jobs */}
      <Link href={'/registration/jobs/allJobs'}>
        <Button variant={'outline'} size={'lg'}>
          View All Jobs
        </Button>
      </Link>
    </div>
  )
}

export default JobAdminButtons
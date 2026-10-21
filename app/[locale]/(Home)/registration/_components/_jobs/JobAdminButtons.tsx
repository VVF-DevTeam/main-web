'use client'

// Libraries
import { useSession } from 'next-auth/react'

// Components
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { hasAdminAccess } from '@/lib/user/roleAccess'

// Main Component
const JobAdminButtons = () => {
  const { data: session, status } = useSession()

  // Don't render anything while loading or if not authenticated
  if (status === 'loading') return null

  const isAdmin = hasAdminAccess(session?.user?.role)

  // Only show buttons for admin users (includes SUPERADMIN)
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
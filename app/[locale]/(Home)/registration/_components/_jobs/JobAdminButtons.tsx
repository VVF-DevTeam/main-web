// Components
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Main Component
const JobAdminButtons = () => {
  return (
    <div className="flex-col-end my-6 gap-x-4 gap-y-3 px-6 md:flex-row flex-end-md">
      {/* Create Event */}
      <Link href={'/registration/jobs/createJob'}>
        <Button variant={'default'} size={'lg'}>
          Create Job
        </Button>
      </Link>
      {/* View All Events */}
      <Link href={'/registration/jobs/allJobs'}>
        <Button variant={'outline'} size={'lg'}>
          View All Jobs
        </Button>
      </Link>
    </div>
  )
}

export  default JobAdminButtons
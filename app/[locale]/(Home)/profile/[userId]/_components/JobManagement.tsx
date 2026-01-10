// Libraries
import { getAllJobs } from '@/lib/actions/job/getJob'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Components
import JobDataTable from './JobDataTable'

interface JobManagementProps {
  user: {
    id: string
    role: string[]
  }
  locale: string
}

export default async function JobManagement({
  user,
  locale,
}: JobManagementProps) {
  // Get all published and unpublished jobs
  const allJobs = await getAllJobs()

  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Jobs Table */}
      <div className="flex items-center justify-between">
        <h1 className="header-sub">All Jobs</h1>
        {/* Create Job */}
        <Link href={`/${locale}/profile/${user.id}?section=admin-create-job`}>
          <Button variant={'default'} className="flex-center gap-x-2">
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Create Job</span>
          </Button>
        </Link>
      </div>

      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished jobs appear here. Click on the
        <span className="hover:text-textColor-brand/70 font-semibold text-textColor-brand900 transition-all">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a job.
      </p>
      <JobDataTable data={allJobs} locale={locale} userId={user.id} />
    </div>
  )
}



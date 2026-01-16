// Components
import JobHeader from '../../_components/_jobs/JobHeader'
import JobDescription from '../../_components/_jobs/JobDescription'
import BackButton from '@/components/ui/back-button'

// Libraries
import { Metadata } from 'next'
import { prisma } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobKeyName: string }>
}): Promise<Metadata> {
  const { jobKeyName } = await params

  // TODO: Simplify code to only query once to get data
  const publishedJob = await prisma.job.findUnique({
    where: {
      keyName: jobKeyName,
    },
    select: {
      title: true,
      summary: true,
    },
  })

  return {
    title: publishedJob?.title,
    description: publishedJob?.title + ' from Viet Vibe Foundation',
    openGraph: {
      title: publishedJob?.title,
      description: publishedJob?.summary + ' from Viet Vibe Foundation'
    },
  }
}

// Interfaces
interface JobPageProps {
  params: Promise<{ locale: string; jobKeyName: string }>
}

// Main Component
const JobPage = async ({ params }: JobPageProps) => {
  const { locale, jobKeyName } = await params

  const publishedJob = await prisma.job.findUnique({
    where: {
      keyName: jobKeyName,
    }
  })

  if (!publishedJob) {
    return
  }

  return (
    <div>
      <div className="gap-y-26 flex flex-col md:gap-y-5 lg:gap-y-0">
        <BackButton />

        <JobHeader
          title={publishedJob.title}
          summary={publishedJob.summary!}
        />
        <JobDescription
          title={publishedJob.title}
          description={publishedJob.description!}
          startDate={publishedJob.startDate!}
          endDate={publishedJob.endDate!}
          location={publishedJob.location!}
          locale={locale}
          id={publishedJob.id}
          keyName={publishedJob.keyName}
          jobType={publishedJob.jobType}
        />
      </div>
    </div>
  )
}

export default JobPage

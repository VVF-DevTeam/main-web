// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import { cn } from '@/lib/utils'

// Components
import { SquareLibrary, MapPin } from 'lucide-react'
import JobButton from './JobButton'

// Interfaces & Types
import { Job } from '@prisma/client'
interface JobCardProps {
  job: Job
}

const JobCard = async ({ job }: JobCardProps) => {

  return (
    <div className="group flex w-[calc(100%-3px)] min-w-[350px] flex-col rounded-lg bg-slate-50 shadow-xl hover:bg-slate-100">
      {/* Header */}
      <div className="relative bg-bgColor-brandLighter pt-10">
        {/* Tags */}
        <div
          className={cn(
            'absolute left-3 top-2 mx-auto max-w-[30%] rounded-xl px-2 py-1 text-center text-base font-semibold text-textColor-white opacity-100 transition-all duration-100',
            job.jobType === 'CLASS'
              ? 'bg-blue-950 hover:bg-blue-700/80'
              : 'bg-yellow-500 hover:bg-yellow-400/80'
          )}
        >
          {job.jobType}
        </div>

        {/* Title */}
        <div className="h-14 border-b-2 border-textColor-brandDark">
          <h2 className="mb-4 text-center text-2xl font-bold">{job.title}</h2>
        </div>
      </div>

      <div className="flex basis-1/2 flex-col gap-y-6 p-4 text-base md:text-lg">
        {/*  Summary */}
        <div className="flex items-start gap-x-2">
          <SquareLibrary className="mt-1 h-5 w-5"></SquareLibrary>
          <span>{job.summary}</span>
        </div>

        {/* Location */}
        <span className="flex items-center gap-x-2 text-xl text-muted-foreground">
          <MapPin className="h-5 w-5"></MapPin>
          {job.location}
        </span>

        {/* Short Description */}
        <div className="flex-between gap-x-2">
          <span className="flex items-center gap-x-2">
            {job.description.replace(/<[^>]+>/g, '').slice(0, 200)}...
          </span>
          <JobButton jobKeyName={job.keyName} />
        </div>
      </div>
    </div>
  )
}

export default JobCard

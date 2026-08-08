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

// Color mapping for job types
const jobTypeColors: Record<string, string> = {
  Marketing: 'bg-purple-600 hover:bg-purple-500/80',
  ProjectManager: 'bg-green-600 hover:bg-green-500/80',
  Finance: 'bg-blue-600 hover:bg-blue-500/80',
  HR: 'bg-yellow-600 hover:bg-yellow-500/80',
  Tech: 'bg-pink-800 hover:bg-pink-800/80',
  Performance: 'bg-blue-300 hover:bg-blue-200/80',
  Volunteer: 'bg-green-700 hover:bg-green-600/80',
}

const formatDescriptionPreview = (html: string, maxLength = 200) =>
  html
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/<\/(p|h[1-6]|li|div|tr|blockquote)>/gi, ' / ')
    .replace(/<[^>]+>/g, '')
    .replace(/\r?\n/g, ' / ')
    .replace(/\s+/g, ' ')
    .replace(/\/+/g, ' / ')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .slice(0, maxLength)

// Main Component
const JobCard = async ({ job }: JobCardProps) => {
  const tagColorClass = jobTypeColors[job.jobType] || 'bg-gray-600 hover:bg-gray-500/80'

  return (
    <div className="group flex w-[calc(100%-3px)] flex-col rounded-lg bg-slate-50 shadow-xl hover:bg-slate-100">
      {/* Header */}
      <div className="relative bg-bgColor-brand200 pt-10">
        {/* Tags */}
        <div
          className={cn(
            'absolute left-3 top-2 mx-auto max-w-[35%] rounded-xl px-2 py-1 text-center text-sm font-semibold text-textColor-white opacity-100 transition-all duration-100 whitespace-nowrap',
            tagColorClass
          )}
        >
          {job.jobType === 'ProjectManager' ? 'Project Manager' : job.jobType}
        </div>

        {/* Title */}
        <div className="border-b-2 border-textColor-brandDark">
          <h2 className="mb-4 text-center text-2xl font-bold">{job.title}</h2>
        </div>
      </div>

      <div className="flex basis-1/2 flex-col gap-y-6 p-4 text-base md:text-lg">
        {/*  Summary */}
        <div className="flex items-start gap-x-2">
          <SquareLibrary className="mt-1 h-5 w-5 shrink-0"></SquareLibrary>
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
            {formatDescriptionPreview(job.description)}...
          </span>
          <JobButton jobKeyName={job.keyName} />
        </div>
      </div>
    </div>
  )
}

export default JobCard

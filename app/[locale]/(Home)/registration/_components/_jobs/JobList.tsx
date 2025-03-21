// Libraries
import React from 'react'

// Components
import { Search } from 'lucide-react'
import JobCard from './JobCard'

// Interfaces & Types
import { Job } from '@prisma/client'

interface JobListProps {
  jobs: Job[]
}

// Main Component
const JobList = ({ jobs }: JobListProps) => {
  return (
    <div>
      {/* Job Posts */}
      <div className="flex w-full flex-col items-center">
        {/* Header */}
        <div className="flex-col-center">
          <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark lg:text-5xl">
            Job Posts
          </h1>

          {/* Search Bar */}
          <div className="flex">
            <Search className="h-6 w-6 text-textColor-brandDark" />
            <input className="border-2" />
          </div>
        </div>

        {/* Job Posts */}
        <div className="flex-col-default grid-all-cols-3 mx-auto mb-5 p-6 md:gap-y-12">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default JobList

// Libraries
import { JobForEditing } from '@/lib/actions/job/getJob'

// Components
import PublishButton from '@/components/ui/PublishButton'
import BackButton from '@/components/ui/back-button'
import JobTitle from './JobTitle'
import JobType from './JobType'
import JobStartDate from './JobStartDate'
import JobEndDate from './JobEndDate'
import JobDescription from './JobDescription'
import JobSummary from './JobSummary'
import JobLocation from './JobLocation'
import JobEvent from './JobEvent'
import EditorInstructions from '@/components/instruction/EditorInstructions'
import DeleteJobButton from './DeleteJobButton'

interface EditJobProps {
  job: JobForEditing
  showBackButton?: boolean
}

export default function EditJob({
  job,
  showBackButton = false,
}: EditJobProps) {

  // Check if field is filled
  const jobFields = [
    !!job.title,
    !!job.jobType,
    !!job.summary,
    !!job.description,
    !!job.startDate,
    !!job.location,
  ]

  // check completed fields
  const completedFields = jobFields.filter(Boolean).length
  const completionText = `(${completedFields} / ${jobFields.length})`
  const canPublish = completedFields === jobFields.length

  return (
    <div className="my-12 p-6 lg:my-20">
      {showBackButton && <BackButton />}
      <div className="mx-auto my-20 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl xl:text-5xl">
              Edit Job
            </h1>
            <span className="text-sm text-muted-foreground">
              Fill all the fields to publish your job.
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Steps completed: {completionText}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex-col-center gap-x-4 gap-y-4 md:flex-row">
            <DeleteJobButton jobId={job.id} />
            <PublishButton
              id={job.id}
              type={'job'}
              canPublish={canPublish}
              isPublished={job.isPublished}
              domain={'jobs'}
            />
          </div>
        </div>

        {/* Job Body */}
        <div className="mt-20 grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:gap-x-8">
          {/* Title */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step I :</span> Title
            </h2>
            <JobTitle job={job} />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step II :</span> Type
            </h2>
            <JobType job={job} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step III :</span> Description
            </h2>
            <EditorInstructions />
            <p className="italic">
              NOTE: The first 200 characters of the description will be
              displayed on the job card outside, so put your most engaging
              statement on top.
            </p>
            <JobDescription job={job} />
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step IV :</span> Summary
            </h2>
            <p className="italic">
              NOTE: The maximum length of summary is 100 characters.
            </p>
            <JobSummary job={job} />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step V :</span> Location
            </h2>
            <JobLocation job={job} />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VI :</span> Start Date
            </h2>
            <JobStartDate job={job} />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VII :</span> End Date
              (Optional)
            </h2>
            <JobEndDate job={job} />
          </div>

          {/* Link to Event */}
          <div className="flex flex-col gap-y-8">
            <h2 className="text-xl font-bold md:text-2xl xl:text-3xl">
              <span className="text-gray-500">Step VIII :</span> Link to Event
              (Optional)
            </h2>
            <JobEvent job={job} />
          </div>
        </div>
      </div>
    </div>
  )
}


import ScheduleItem from './ScheduleItem'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ClassDescriptionProps {
  description: string
  startDate: Date
  endDate: Date
  startTime: Date
  duration: string
  capacity: number
  location: string
  instructor: string
  schedules: {
    id:number
    startTime: Date
    duration: string
    endTime: Date
    action: string
  }[]
}

const ClassDescription = ({
  description,
  startDate,
  endDate,
  startTime,
  location,
  schedules,
}: ClassDescriptionProps) => {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-8 p-6 md:p-12 lg:gap-y-8 lg:p-16">
      {/* Time and Location */}
      <div className="grid gap-x-4 md:flex w-full justify-between gap-y-4">
        <div>
          <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
            Time & Location
          </h1>
          <p>
            {startDate.toLocaleDateString('en-GB').substring(0, 5)},{' '}
            {startTime.toLocaleTimeString('en-GB').substring(0, 5)} -{' '}
            {endDate.toLocaleTimeString('en-GB').substring(0, 5)}
          </p>
          <p>{location}</p>
        </div>
        <div>
          <iframe
            src="https://www.google.com/maps/d/u/0/embed?mid=1Bid48QaiPGoMB5agPc-ZaoZfLrtYc3g&ehbc=2E312F&noprof=1"
            title = "Our location"
            width="300"
            height="200"
        ></iframe>
        </div>
      </div>

      {/* Event Description */}
      <div>
        <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
          About The Event
        </h1>
        <p>{description}</p>
      </div>

      {/* Schedule */}
      <div className="min-w-full">
        <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
          Schedule
        </h1>
        <div className="flex flex-col gap-y-4">
          {schedules.map((schedule) => (
            <ScheduleItem
              key = {schedule.id}
              startTime={schedule.startTime}
              duration={schedule.duration}
              endTime={schedule.endTime}
              action={schedule.action}
            />
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <Link href='https://forms.gle/Z2z2gfggF5AyG5Rr9'><Button>Reserve Now</Button></Link>
    </div>
  )
}

export default ClassDescription

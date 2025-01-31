interface ScheduleItemProps {
  startTime: Date
  duration: string
  endTime: Date
  action: string
}

const ScheduleItem = ({
  startTime,
  duration,
  endTime,
  action,
}: ScheduleItemProps) => {
  return (
    <div className='border-b-2 border-gray-500 py-6 flex gap-x-24 min-w-full'>
      {/* Time Div */}
      <div className='flex flex-col'>
        <span>
          {startTime.toLocaleTimeString('en-GB').substring(0, 5)} -{' '}
          {endTime.toLocaleTimeString('en-GB').substring(0, 5)}
        </span>
        <span className='text-muted-foreground'>{duration}</span>
      </div>

      {/* Action Div */}
      <div className='flex flex-col'>
        <span>{action}</span>
      </div>
    </div>
  )
}

export default ScheduleItem

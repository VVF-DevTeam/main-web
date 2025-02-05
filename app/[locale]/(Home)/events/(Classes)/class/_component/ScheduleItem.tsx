import initTranslation from "@/app/i18n"

interface ScheduleItemProps {
  startTime: Date
  duration: string
  endTime: Date
  action: string
  locale: string
}

const ScheduleItem = async({
  startTime,
  duration,
  endTime,
  action,
  locale
}: ScheduleItemProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

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
        <span>{t(action)}</span>
      </div>
    </div>
  )
}

export default ScheduleItem

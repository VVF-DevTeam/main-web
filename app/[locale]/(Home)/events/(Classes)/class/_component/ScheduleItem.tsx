// Libraries
import initTranslation from '@/app/i18n'

// Interfaces
interface ScheduleItemProps {
  startTime: string
  endTime: string
  description: string
  locale: string
}

// Main Code
const ScheduleItem = async ({
  startTime,
  endTime,
  description,
  locale,
}: ScheduleItemProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  const duration = '0.5 hours'

  // TODO: Add a duration calculator function
  // const calcDuration = (startTime: string, endTime: string) => {}

  return (
    <div className="flex min-w-full gap-x-24 border-b-2 border-gray-500 py-6">
      {/* Time */}
      <div className="flex flex-col">
        <span>
          {startTime} - {endTime}
        </span>
        <span className="text-muted-foreground">{duration}</span>
      </div>

      {/* Action */}
      <div className="flex flex-col">
        <span>{t(description)}</span>
      </div>
    </div>
  )
}

export default ScheduleItem

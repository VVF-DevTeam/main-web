import initTranslation from '@/app/i18n'

interface ScheduleItemProps {
  startTime: string
  endTime: string
  description: string
  locale: string
}

const ScheduleItem = async ({
  startTime,
  endTime,
  description,
  locale,
}: ScheduleItemProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  const calcDuration = (startTime: string, endTime: string) => {
    const splitStart = startTime.split(':')
    const splitEnd = endTime.split(':')

    let hours = 0
    let minutes = 0

    //  Calculate the minutes
    if (parseInt(splitEnd[1]) - parseInt(splitStart[1]) < 0) {
      minutes = 60 - parseInt(splitStart[1]) + parseInt(splitEnd[1])
      hours = hours - 1
    } else {
      minutes = parseInt(splitEnd[1]) - parseInt(splitStart[1])
    }

    // Calculate the hours
    if (parseInt(splitEnd[0]) - parseInt(splitStart[0]) < 0) {
      hours += 24 + parseInt(splitStart[0]) - parseInt(splitEnd[0])
    } else {
      hours += parseInt(splitEnd[0]) - parseInt(splitStart[0])
    }

    return `${hours}h : ${minutes}m`
  }

  return (
    <div className="flex min-w-full gap-x-24 border-b-2 border-gray-500 py-6">
      {/* Time */}
      <div className="flex flex-col">
        <span>
          {startTime} - {endTime}
        </span>
        <span className="text-muted-foreground">
          {calcDuration(startTime, endTime)}
        </span>
      </div>

      {/* Action */}
      <div className="flex flex-col">
        <span>{t(description)}</span>
      </div>
    </div>
  )
}

export default ScheduleItem

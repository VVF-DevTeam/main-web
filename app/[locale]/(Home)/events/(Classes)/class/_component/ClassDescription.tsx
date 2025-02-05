import ScheduleItem from './ScheduleItem'
import { Button } from '@/components/ui/button'
import initTranslation from '@/app/i18n'
interface ClassDescriptionProps {
  description: string
  startDate: Date
  endDate: Date
  endTime: Date
  startTime: Date
  duration: string
  capacity: number
  location: string
  instructor: string
  locale: string
  dates: string[]
  schedules: {
    id: number
    startTime: Date
    duration: string
    endTime: Date
    action: string
  }[]
}

const ClassDescription = async({
  description,
  startDate,
  startTime,
  location,
  schedules,
  endTime,
  endDate,
  locale,
  dates
}: ClassDescriptionProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-8 p-6 md:p-12 lg:gap-y-8 lg:p-16">
      {/* Time and Location */}
      <div className="grid w-full justify-between gap-x-4 gap-y-4 md:flex">
        <div>
          <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
            {t('headerInfo-guitar')}
          </h1>
          <p>
            {t('dateHeader-guitar')}:{' '}{startDate.toLocaleDateString('en-GB', {day:'numeric', month: 'short' })} -{' '}
            {endDate.toLocaleDateString('en-GB', {day:'numeric', month: 'short' })}, 
          </p>
          <p>
          {t('timeHeader-guitar')}: {dates.map((date) => t(date)).join(', ')} {t('everyWeek')}, {' '}{startTime.toLocaleTimeString('en-GB').substring(0, 5)} -{' '}
          {endTime.toLocaleTimeString('en-GB').substring(0, 5)}
          </p>
          <p>{location} ({t('TBD')})</p>
        </div>
        <div>
          <iframe
            src="https://www.google.com/maps/d/u/5/embed?mid=1pqdfvsCcNlRJQx5ZQfFsx7TFghOn44o&ehbc=2E312F"
            title = "VVF Beginner Guitar Lesson"
            width="300"
            height="250"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Event Description */}
      <div>
        <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
          {t('headerAbout-guitar')}
        </h1>
        <p>{t(description)}</p>
      </div>

      {/* Schedule */}
      <div className="min-w-full">
        <h1 className="mb-2 font-[Poppins] text-xl font-extrabold md:text-3xl lg:text-4xl">
        {t('headerSchedule-guitar')}
        </h1>
        <h3 className="mb-2 font-[Poppins] italic">
          ({t('subHeaderSchedule-guitar')})
        </h3>
        <div className="flex flex-col gap-y-4">
          {schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              startTime={schedule.startTime}
              duration={schedule.duration}
              endTime={schedule.endTime}
              action={schedule.action}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <a
        href="https://docs.google.com/forms/d/1u6MqzvwTdQhEwiwBNa1mf_IIEpWiKpK9dDWk-85Vv0E/viewform?edit_requested=true"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>{t('reserve-button')}</Button>
      </a>
    </div>
  )
}

export default ClassDescription

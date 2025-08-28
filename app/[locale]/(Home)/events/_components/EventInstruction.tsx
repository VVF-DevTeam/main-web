// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventStep from './EventStep'

// Data
const EventStepList = [
  {
    step: '01',
    title: 'Find Events',
    description:
      'Find and select the events you want to attend. You can filter events by date, location, and price.',
  },
  {
    step: '02',
    title: 'Fill Registration Form',
    description:
      'Fill in the registration form with your personal information to let us know you are attending the event.',
  },
  {
    step: '03',
    title: 'Pay and Receive Reservation',
    description:
      'Make payments through our secure payment system and receive your reservation confirmation email.',
  },
]

// Main Component
interface EventInstructionProps {
  locale: string
}

const EventInstruction = async ({ locale }: EventInstructionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="mx-auto bg-gray-100 px-12 py-16 dark:bg-gray-100">
      <h1 className="text-center text-3xl font-bold tracking-wide dark:text-textColor">
        {t('header-eventInstruction')}
      </h1>
      <div className="flex-col-default grid-all-cols-3 py-10">
        {EventStepList.map((stage, index) => (
          <EventStep key={index} step={stage.step} locale={locale} />
        ))}
      </div>
    </div>
  )
}

export default EventInstruction

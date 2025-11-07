// Libraries
import initTranslation from '@/app/i18n'

// Interfaces
interface EventStepProp {
  step: string
  locale: string
}

// Main Component
const EventStep = async ({ step, locale }: EventStepProp) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="flex-col-center gap-y-6">
      <div
        className="flex-center h-16 w-16 rounded-full bg-blue-500 p-10 text-2xl font-bold text-textColor-white"
        aria-label={`Step ${step}`}
      >
        {step}
      </div>
      <h3 className="text-center text-2xl font-bold tracking-wide">
        {t('header-step' + step)}
      </h3>
      <p className="text-center text-xl text-textColor-gray500">
        {t('description-step' + step)}
      </p>
    </div>
  )
}

export default EventStep

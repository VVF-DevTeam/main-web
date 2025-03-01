import initTranslation from '@/app/i18n'

interface EventStepProp {
  step: string
  locale: string
}

const EventStep = async ({ step, locale }: EventStepProp) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['event', 'common'])
  
  return (
    <div className="flex flex-col items-center justify-center gap-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 p-10 text-2xl font-bold text-white">
        {step}
      </div>
      <h3 className="text-2xl font-bold tracking-wide text-center">{t('header-step' + step)}</h3>
      <p className="text-center text-xl text-textColor-gray">{t('description-step' + step)}</p>
    </div>
  )
}

export default EventStep

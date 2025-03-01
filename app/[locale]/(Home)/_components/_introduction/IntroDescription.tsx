'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface IntroDescriptionProps {
  title: string
  description: string
}

const IntroDescription = ({ title, description }: IntroDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex-col-center text-place-default default-gap pr-6 md:max-w-96">
      <h1 className="text-3xl font-bold tracking-wide text-textColor">
        {t(title)}
      </h1>
      <p className="text-textColor text-sm">{t(description)}</p>
      <button
        className="button-default md:place-self-start"
        onClick={() => router.push('/events')}
      >
        {t('button-introduction')}
      </button>
    </div>
  )
}

export default IntroDescription

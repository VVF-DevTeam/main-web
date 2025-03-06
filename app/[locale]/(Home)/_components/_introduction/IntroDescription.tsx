
import { Button } from '@/components/ui/button'
import initTranslation from '@/app/i18n'
import Link from 'next/link'

interface IntroDescriptionProps {
  title: string
  description: string
  locale: string
}

const IntroDescription = async({ title, description, locale }: IntroDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex-col-center text-place-default default-gap pr-6 md:max-w-96">
      <h1 className="text-3xl font-bold tracking-wide text-textColor">
        {t(title)}
      </h1>
      <p className="text-sm text-gray-700">{t(description)}</p>
      <Link href={'/events'}>
        <Button variant={'default'}>
          {t('button-introduction')}
        </Button>
      </Link>
    </div>
  )
}

export default IntroDescription

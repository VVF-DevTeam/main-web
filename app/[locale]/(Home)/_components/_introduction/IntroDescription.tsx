// Libraries
import initTranslation from '@/app/i18n'

// Components
import Link from 'next/link'
import { Button } from '@/components/ui/button'

//Interfaces
interface IntroDescriptionProps {
  title: string
  description: string
  locale: string
}

// Main Component
const IntroDescription = async ({
  title,
  description,
  locale,
}: IntroDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex-col-center text-place-default default-gap pr-6 md:max-w-96">
      <h1 className="text-3xl font-bold tracking-wide text-textColor dark:text-textColor-white">
        {t(title)}
      </h1>
      <p className="text-sm text-textColor dark:text-textColor-white">{t(description)}</p>
      <Link href={'/events'} className="md:place-self-start">
        <Button variant={'default'}>{t('button-introduction')}</Button>
      </Link>
    </div>
  )
}

export default IntroDescription

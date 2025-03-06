
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
    <div className="my-auto flex basis-1/2 flex-col gap-y-8 pr-6 text-center text-[20px] font-light md:max-w-96 md:text-left">
      <h1 className="text-3xl font-bold tracking-wide text-[#3d3a3a]">
        {t(title)}
      </h1>
      <div className="flex flex-col gap-y-6">
        <p className="text-sm text-gray-700">{t(description)}</p>
      </div>
      <Link href={'/events'}>
        <Button className="bg-[#C54B3E] p-3 text-sm font-semibold text-white">
          {t('button-introduction')}
        </Button>
      </Link>
    </div>
  )
}

export default IntroDescription

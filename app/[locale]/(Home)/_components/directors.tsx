import Image from 'next/image'
import initTranslation from '@/app/i18n'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DirectorsProps {
  locale: string
}
const Directors = async ({ locale }: DirectorsProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-y-10 pb-10 pt-8 md:mt-16 md:p-12 lg:mt-24 lg:gap-y-12 lg:pb-28 lg:pt-14">
      <span className="pb-8 text-4xl font-semibold italic tracking-wide text-[#3d3a3a] md:text-5xl">
        {t('header-director')}
      </span>
      <div className="grid grid-cols-[50%_50%] pb-5">
        <div className="grid w-full justify-end gap-x-6 border-r-[1px] border-[#3d3a3a] pl-10 pr-2 md:flex">
          <Image
            src="/bio/trong-nguyen.jpg"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="h-[140px] w-[140px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-xl font-semibold text-[#3d3a3a]">
              {t('name1-director')}
            </span>
            <span className="text-sm font-semibold text-[#C54B3E]">
              {t('title1-director')}
            </span>
            <span className="max-w-[300px] text-sm text-[#1B171A]">
              {t('description1-director')}
            </span>
          </div>
        </div>
        <div className="grid w-full justify-start gap-x-6 pl-10 md:flex">
          <Image
            src="/bio/eattle-nguyen-1.jpg"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="h-[140px] w-[140px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-xl font-semibold text-[#3d3a3a]">
              {t('name2-director')}
            </span>
            <span className="text-sm font-semibold text-[#C54B3E]">
              {t('title2-director')}
            </span>
            <span className="max-w-[300px] text-sm text-[#1B171A]">
              {t('description2-director')}
            </span>
          </div>
        </div>
      </div>
      <Link href={'/about/directors'}>
        <Button className="w-36 bg-[#C54B3E] p-3 text-sm font-semibold text-white">
          {t('button-director')}
        </Button>
      </Link>
    </div>
  )
}

export default Directors

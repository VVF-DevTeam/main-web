// Libraries
import initTranslation from '@/app/i18n'

// Components
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Interfaces
interface DirectorsProps {
  locale: string
}

// Main Component
const Directors = async ({ locale }: DirectorsProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex-col-center h-full w-full gap-y-10 pb-10 pt-8 md:p-12 lg:gap-y-12 lg:pb-28 lg:pt-14">
      <span className="header-font-black header-sub pb-4 italic md:pb-8">
        {t('header-director')}
      </span>
      <div className="flex-col-default grid-all-cols-2 gap-x-0 pb-5">
        {/* First Director */}
        <div className="flex-col-center w-full gap-y-3 md:flex-row md:justify-end md:gap-x-5 md:border-r-[1px] md:border-[#3d3a3a] md:pr-2">
          <Image
            src="https://drive.google.com/thumbnail?id=150ts6Imd6vEJDJIu9BSLaoD9xm-FC_4u&sz=w1000"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="h-[140px] w-[140px] rounded-full object-cover"
          />
          <div className="flex-col-center gap-y-2 md:items-start">
            <span className="header-font-black text-xl font-bold">
              {t('name1-director')}
            </span>
            <span className="header-font-black text-sm font-semibold text-textColor-brand">
              {t('title1-director')}
            </span>
            <span className="max-w-[300px] text-center text-sm md:text-left">
              {t('description1-director')}
            </span>
          </div>
        </div>
        {/* Second Director */}
        <div className="flex-col-center w-full gap-x-5 gap-y-3 md:flex-row md:justify-start md:pl-4">
          <Image
            src="https://drive.google.com/thumbnail?id=14oie7aYFMkMRwPYx9Ngty7B7wx-2NczG&sz=w1000"
            alt="Eattle Nguyen"
            width={200}
            height={50}
            className="h-[140px] w-[140px] rounded-full object-cover"
          />
          <div className="flex-col-center gap-y-2 md:items-start">
            <span className="header-font-black text-xl font-bold">
              {t('name2-director')}
            </span>
            <span className="header-font-black text-sm font-semibold text-textColor-brand">
              {t('title2-director')}
            </span>
            <span className="max-w-[300px] text-center text-sm md:text-left">
              {t('description2-director')}
            </span>
          </div>
        </div>
      </div>
      <Link href={'/about/directors'}>
        <Button className="w-36 p-3" variant={'default'}>
          {t('button-director')}
        </Button>
      </Link>
    </div>
  )
}

export default Directors

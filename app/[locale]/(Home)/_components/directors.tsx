'use client'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const Directors = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex-col-center h-full w-full gap-y-10 pb-10 pt-8 md:p-12 lg:gap-y-12 lg:pb-28 lg:pt-14">
      <Separator className="w-1/2 bg-bgColor-brand" />
      <span className="header-font-black header-sub pb-8 italic">
        {t('header-director')}
      </span>
      <div className="flex-col-default grid-all-cols-2 pb-5 gap-x-0">
        {/* First Director */}
        <div className="w-full justify-end gap-x-5 md:border-r-[1px] md:border-[#3d3a3a] pr-2 md:flex">
          <Image
            src="https://drive.google.com/thumbnail?id=150ts6Imd6vEJDJIu9BSLaoD9xm-FC_4u&sz=w1000"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="header-font-black text-xl font-bold">
              {t('name1-director')}
            </span>
            <span className="header-font-black text-textColor-brand text-sm font-semibold">
              {t('title1-director')}
            </span>
            <span className="max-w-[300px] text-sm">
              {t('description1-director')}
            </span>
          </div>
        </div>
        {/* Second Director */}
        <div className="w-full justify-start gap-x-5 md:pl-4 md:flex">
          <Image
            src="https://drive.google.com/thumbnail?id=14oie7aYFMkMRwPYx9Ngty7B7wx-2NczG&sz=w1000"
            alt="Eattle Nguyen"
            width={200}
            height={50}
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="header-font-black text-xl font-bold">
              {t('name2-director')}
            </span>
            <span className="header-font-black text-textColor-brand text-sm font-semibold">
              {t('title2-director')}
            </span>
            <span className="max-w-[300px] text-sm">
              {t('description2-director')}
            </span>
          </div>
        </div>
      </div>
      <button
        className="button-default w-36"
        onClick={() => router.push('/about/directors')}
      >
        {t('button-director')}
      </button>
    </div>
  )
}

export default Directors

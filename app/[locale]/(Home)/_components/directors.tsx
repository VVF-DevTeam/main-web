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
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-10 pb-10 pt-8 md:p-12 lg:gap-y-12 lg:pb-28 lg:pt-14">
      <Separator className="w-1/2 bg-[#7f0000]" />
      <span className="pb-8 font-[Poppins] text-4xl font-semibold italic tracking-wide text-[#3d3a3a] md:text-5xl">
        {t('header-director')}
      </span>
      <div className="grid grid-cols-[50%_50%] pb-5">
        <div className="grid w-full justify-end gap-x-6 border-r-[1px] border-[#3d3a3a] pl-10 pr-2 md:flex">
          <Image
            src="/bio/trong-nguyen.jpg"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="font-[Poppins] text-xl font-semibold text-[#3d3a3a]">
              {t('name1-director')}
            </span>
            <span className="font-[Poppins] text-sm font-semibold text-[#C54B3E]">
              {t('title1-director')}
            </span>
            <span className="max-w-[300px] font-[Poppins] text-sm text-[#1B171A]">
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
            className="h-[120px] w-[120px] rounded-full object-cover"
          />
          <div className="flex flex-col gap-y-2">
            <span className="font-[Poppins] text-xl font-semibold text-[#3d3a3a]">
              {t('name2-director')}
            </span>
            <span className="font-[Poppins] text-sm font-semibold text-[#C54B3E]">
              {t('title2-director')}
            </span>
            <span className="max-w-[300px] font-[Poppins] text-sm text-[#1B171A]">
              {t('description2-director')}
            </span>
          </div>
        </div>
      </div>
      <button
        className="w-36 bg-[#C54B3E] p-3 text-sm font-semibold text-white"
        onClick={() => router.push('/about/directors')}
      >
        {t('button-director')}
      </button>
    </div>
  )
}

export default Directors

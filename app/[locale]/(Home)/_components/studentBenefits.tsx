import initTranslation from '@/app/i18n'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface StudentBenefitsProps {
  locale: string
}

const StudentBenefits = async ({ locale }: StudentBenefitsProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex flex-col gap-y-5 bg-bgColor-secondary100 p-4 pb-10 pt-10 text-base md:pb-[80px] md:pt-[60px] md:text-lg lg:pb-[120px]">
      <h1 className="web_h1 text-center">{t('studentBenefitsSection-title')}</h1>
      <h2 className="web-body-regular text-center">
        {t('studentBenefitsSection-description')}
      </h2>

      <div className="flex flex-col items-center justify-center gap-y-6 pt-5 md:grid md:grid-cols-2">
        <div className="flex w-full max-w-[540px] flex-col justify-end gap-y-6 text-left md:ml-auto">
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1vsJ3EA4HUbiFjdyqaAgg9RduNN2staec"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="web_h4 text-center">{t('studentBenefitsSection-benefit-1-title')}</h3>
            </div>
            <p className="web-body-regular text-center">
              {t('studentBenefitsSection-benefit-1-description')}
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1Ee7WcmpXhrobD1hV2VURGtjkRrxh9Oxt"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="web_h4 text-center">{t('studentBenefitsSection-benefit-2-title')}</h3>
            </div>
            <p className="web-body-regular text-center">
              {t('studentBenefitsSection-benefit-2-description')}
            </p>
          </div>

          <Link href="/students" className="self-center">
            <Button variant="default" className="w-[260px] text-base web-button-bold">
              {t('learnMore')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-start md:pl-16">
          <Image
            src="https://drive.google.com/thumbnail?id=1QlxKyscd4i38AN9QOXcGudXyJI9RvN0Q"
            alt="Student Benefits"
            width={500}
            height={500}
            className="rounded-2xl"
          />
        </div>
      </div>
    </div>
  )
}

export default StudentBenefits

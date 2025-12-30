// Libraries
import initTranslation from '@/app/i18n'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MembershipBenefit2 from './MembershipBenefit2'
interface MembershipBenefitsProps {
  locale: string
}

const MembershipBenefits = async ({ locale }: MembershipBenefitsProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])

  return (
    <div className="flex flex-col gap-y-5 bg-bgColor-secondary100 p-4 pb-10 pt-10 text-base md:pb-[80px] lg:pb-[120px] md:pt-[60px] md:text-lg">
      <h1 className="web_h1 text-center"> {t('homepage-membership-header')}</h1>
      <h2 className="web-body-regular text-center">
        {t('homepage-membership-description')}
      </h2>
      <div className="flex flex-col items-center justify-center gap-y-6 pt-5 md:grid md:grid-cols-2">
        <div className="flex items-center justify-end md:pr-16">
          <Image
            src="https://drive.google.com/thumbnail?id=1a75ZM7UwXhXp43MjDt6WgYjtyccVWyQU"
            alt="Membership Benefits 1"
            width={500}
            height={500}
            className="rounded-2xl"
          />
        </div>
        <div className="flex flex-col justify-between gap-y-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1vsJ3EA4HUbiFjdyqaAgg9RduNN2staec"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="web_h4">
                {t('basic-feature-1-1')}
              </h3>
            </div>
            <p className="web-body-regular">{t('membership-benefit-1-description')}</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1Ee7WcmpXhrobD1hV2VURGtjkRrxh9Oxt"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="web_h4 ">
                {t('basic-feature-2')}
              </h3>
            </div>
            <MembershipBenefit2 />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1WvFAzDkYu1HjKP4nPUgCDxyWzylpgilu"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="web_h4">
                {t('basic-feature-3-1')}
              </h3>
            </div>
            <p className="web-body-regular">{t('membership-benefit-3-description')}</p>
          </div>
          <Link href="/registration/membership">
            <Button variant="default" className="w-[260px] text-base web-button-bold">
              {' '}
              {t('register')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MembershipBenefits

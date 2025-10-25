// Libraries
import initTranslation from '@/app/i18n'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
interface MembershipBenefitsProps {
  locale: string
}

const MembershipBenefits = async ({ locale }: MembershipBenefitsProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])

  return (
    <div className="flex flex-col gap-y-5 p-4 pb-10 text-base md:pb-8 md:pt-10 md:text-lg lg:pb-[120px] lg:pt-[12px]">
      <h1 className="header-main text-center"> {t('homepage-membership-header')}</h1>
      <h2 className="text-center">
        {t('homepage-membership-description')}
      </h2>
      <div className="flex flex-col md:grid gap-y-6 md:grid-cols-2 items-center justify-center pt-5">
        <div className="flex items-center justify-end md:pr-16">
          <Image
            src="https://drive.google.com/thumbnail?id=1a75ZM7UwXhXp43MjDt6WgYjtyccVWyQU&sz=w1000"
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
                src="https://drive.google.com/thumbnail?id=1a-Qg9wysoBE7isCJzuJbKxHoj6bu-yWJ&sz=w100"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="text-[24px] font-semibold leading-[28px]">
                {t('basic-feature-1-1')}
              </h3>
            </div>
            <p className="text-base">{t('membership-benefit-1-description')}</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1YXenDbJ3qI94bypXneId23WiyOcnv016&sz=w100"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="text-[24px] font-semibold leading-[28px]">
                {t('basic-feature-2')}
              </h3>
            </div>
            <p className="text-base">{t('membership-benefit-2-description')}</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="https://drive.google.com/thumbnail?id=1Y5a02Gsj46mulIzPleNVTLyHOZ3w67x7&sz=w100"
                alt="bullet point"
                width={20}
                height={20}
                className="mt-1 shrink-0"
              />
              <h3 className="text-[24px] font-semibold leading-[28px]">
                {t('basic-feature-3-1')}
              </h3>
            </div>
            <p className="text-base">{t('membership-benefit-3-description')}</p>
          </div>
          <Link href="/registration/membership">
            <Button variant="default" className="w-[260px]">
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

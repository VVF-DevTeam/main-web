import React from 'react'
import Link from 'next/link'
import initTranslations from '@/app/i18n'

// Components
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

// Interface & Type
interface HeaderAndBenefitPreviewProps {
  locale: string
}

// Short Preview Component
const JoinUs = async ({ locale }: HeaderAndBenefitPreviewProps) => {
  const { t } = await initTranslations(locale, ['job', 'common'])

  return (
    <div className="flex-col-center gap-y-8 px-5 py-3 lg:py-5 text-center">
      {/* Header */}
      <div>
        <h2 className="header-font-black header-sub">
          {t('join-us')}
        </h2>
      </div>

      {/* Short Description */}
      <p className="max-w-xl text-base text-muted-foreground">
        {t('benefits-description1')}
      </p>

      <p className="max-w-xl text-base text-muted-foreground">
        {t('benefits-description3')}
      </p>

      {/* CTA Button */}
      <Link href="/registration/jobs">
        <Button variant="default" className="mt-4">
          {t('learn-more')}
        </Button>
      </Link>
      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brand md:w-1/2" />
    </div>
  )
}

export default JoinUs

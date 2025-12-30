'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import BusinessDiscountModal from '@/app/[locale]/(Home)/registration/_components/_membership/BusinessDiscountModal'
import { businessData } from '@/app/[locale]/(Home)/registration/_components/_membership/businessData'

const MembershipBenefit2 = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('membership')

  return (
    <p className="web-body-regular">
      {t('membership-benefit-2-description')}{' '}
      <BusinessDiscountModal
        businesses={businessData}
        triggerText={t('view-partners')}
      />
    </p>
  )
}

export default MembershipBenefit2


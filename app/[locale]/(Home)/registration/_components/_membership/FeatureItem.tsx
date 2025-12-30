'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import BusinessDiscountModal from './BusinessDiscountModal'
import { businessData } from './businessData'

interface FeatureItemProps {
  feature: string
  featureKey: string
  locale: string
}

const FeatureItem = ({ feature, featureKey, locale }: FeatureItemProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('membership')
  // Check if this is the basic-feature-2 that needs the modal
  const isBusinessFeature = featureKey === 'basic-feature-2'

  return (
    <li className="flex items-center">
      <svg
        className="mr-2 text-green-500 shrink-0"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>
        {feature}
        {isBusinessFeature && (
          <>
            {' '}
            <BusinessDiscountModal
              businesses={businessData}
              triggerText={t('view-partners')}
            />
          </>
        )}
      </span>
    </li>
  )
}

export default FeatureItem


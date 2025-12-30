'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import BusinessDiscountModal from './BusinessDiscountModal'

interface FeatureItemProps {
  feature: string
  featureKey: string
  locale: string
}

// Sample business data - you can move this to a config file or database later
const businessData = [
  { name: 'Lululemon Canada', discount: 'Up to 15%', link: 'https://shop.lululemon.com/en-ca/' },
  { name: 'Concept Studio', discount: '50%', link: '' },
  { name: 'Family Photo Shoot at An Nhien Studio', discount: 'Up to 50%', link: '' },
  { name: 'Corozo Home - Rent Apartment in Vietnam', discount: 'Up to 10%', link: 'https://www.corozohome.com' },
  { name: 'Legend Dessert', discount: 'Up to 10%', link: 'https://www.instagram.com/freshlegendbyelizasweet' },
  { name: 'Kitchen Katherina', discount: 'Up to 10%', link: 'https://www.facebook.com/kitchenkatherina' },
  { name: 'Eligible for scholarship at Eattle Music Class', discount: 'Up to 900$', link: 'https://www.facebook.com/profile.php?id=61585610757814' },
  { name: 'Eligible for scholarship at Andy\'s Tennis & Pickle Ball Academy', discount: 'Upon contact', link: 'https://www.facebook.com/andynguyencad' },
]

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


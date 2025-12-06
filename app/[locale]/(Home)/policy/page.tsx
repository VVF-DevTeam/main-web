import React from 'react'
import PrivacyPolicy from '../_components/_policy/PrivacyPolicy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - VVF',
  description: 'Privacy Policy - VVF',
  openGraph: {
    title: 'Privacy Policy - VVF',
    description: 'Privacy Policy - VVF',
  },
}

// Force static generation for this route
export const dynamic = 'force-static'

const Policy = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  return (
    <div>
      <PrivacyPolicy locale={locale} />
    </div>
  )
}

export default Policy

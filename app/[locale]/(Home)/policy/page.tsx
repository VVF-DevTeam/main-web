import React from 'react'
import PrivacyPolicy from '../_components/_policy/PrivacyPolicy'

const Policy = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  return (
    <div>
      <PrivacyPolicy locale={locale} />
    </div>
  )
}

export default Policy

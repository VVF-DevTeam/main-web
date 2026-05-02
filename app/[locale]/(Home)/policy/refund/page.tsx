import React from 'react'
import { Metadata } from 'next'
import RefundPolicy from '../../_components/_policy/RefundPolicy'

export const metadata: Metadata = {
  title: 'Refund Policy - VVF',
  description: 'Refund Policy - VVF',
  openGraph: {
    title: 'Refund Policy - VVF',
    description: 'Refund Policy - VVF',
  },
}

export const dynamic = 'force-static'

const RefundPolicyPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  return (
    <div>
      <RefundPolicy locale={locale} />
    </div>
  )
}

export default RefundPolicyPage

// Components
import About from '@/app/[locale]/(Home)/about/_components/_vision/about'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - VVF',
  description: 'About Us - VVF',
  openGraph: {
    title: 'About Us - VVF',
    description: 'About Us - VVF',
  },
}

// Main Component
const AboutPageVision = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div>
      <About locale={locale} />
    </div>
  )
}

export default AboutPageVision

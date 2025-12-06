// Components
import OrgMembers from '../_components/_directors/OrgMembers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members - VVF',
  description: 'Members - VVF',
}

// Force static generation for this route
export const dynamic = 'force-static'

// Main Component
const AboutPageDirectors = async({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  return (
    <div className="h-full w-full">
      <OrgMembers locale={locale}/>
    </div>
  )
}

export default AboutPageDirectors

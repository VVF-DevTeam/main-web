// Libraries
import { Separator } from '@/components/ui/separator'

// Components
import { MembershipHeader } from '../_components/_membership/MembershipHeader'
import { MembershipBenefits } from '../_components/_membership/MembershipBenefits'

// No use of auth() or header or live database, so can be static
export const dynamic = 'force-dynamic'

const MembershipPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-y-6 px-4 text-base p-4 md:text-lg">
      <MembershipHeader locale={locale} />
      <Separator className="my-4" />
      <MembershipBenefits locale={locale} />
    </div>
  )
}

export default MembershipPage

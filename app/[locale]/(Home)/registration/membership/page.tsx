// Libraries
import { Separator } from '@/components/ui/separator'

// Components
import { MembershipHeader } from '../_components/_membership/MembershipHeader'
import { MembershipBenefits } from '../_components/_membership/MembershipBenefits'

const MembershipPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-y-6 p-4 md:pb-8 text-base md:text-lg">
      <MembershipHeader locale={locale} />
      <Separator className="my-4" />
      <MembershipBenefits locale={locale} />
    </div>
  )
}

export default MembershipPage

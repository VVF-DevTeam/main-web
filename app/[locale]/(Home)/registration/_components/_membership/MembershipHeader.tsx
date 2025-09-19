// Libraries
import initTranslation from '@/app/i18n'
import { Separator } from '@/components/ui/separator'

interface MembershipHeaderProps {
  locale: string
}

export const MembershipHeader = async ({ locale }: MembershipHeaderProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])

  return (
    <div className="flex-col-center space-y-4 text-center">
      <div className="flex-col-center">
        <h1 className="header-sub header-font-default text-4xl text-textColor-brandDark dark:text-textColor-brand">
          {t('membership-header')}
        </h1>
        <Separator className="w-[110%] bg-bgColor-brandDark dark:bg-bgColor-brand" />
      </div>
      <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 ">
        {t('membership-description')}
      </p>
    </div>
  )
}

// Libraries
import initTranslation from '@/app/i18n'

// Interfaces
interface CopyrightProps {
  locale: string
}

// Main Component
const Copyright = async ({ locale }: CopyrightProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex-center header-font-white h-[34px] bg-bgColor-brand px-8">
      <span>{t('content-copyRight')}</span>
    </div>
  )
}

export default Copyright

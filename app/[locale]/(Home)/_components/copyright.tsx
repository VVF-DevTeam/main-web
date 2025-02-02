import initTranslation from '@/app/i18n'

interface CopyrightProps {
  locale: string
}

const Copyright = async({locale}:CopyrightProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="flex h-[45px] w-full flex-row items-center bg-[#a9382b] px-8 text-slate-300 justify-center">
      <div className="flex gap-x-2">
        <span>{t('content-copyRight')}</span>
      </div>
    </div>
  )
}   

export default Copyright
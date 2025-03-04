import initTranslations from '@/app/i18n'

interface MemberDescriptionProps {
  title: string
  description: string
  locale: string
  name: string
  bio: string
}

const MemberDescription = async ({
  title,
  description,
  locale,
  name,
  bio,
}: MemberDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslations(locale, ['about', 'common'])

  return (
    <div className="flex-col-center my-auto gap-y-8">
      <h1 className="header-text header-font-black font-bold">{name} ({title})</h1>
      <div className="flex-col-center gap-y-6 text-center tracking-wide text-textColor lg:text-pretty">
        <p className='text-textColor-brand'>
        {t(description)}
        </p>
        <p>
          {t(bio)}
        </p>
      </div>
    </div>
  )
}

export default MemberDescription

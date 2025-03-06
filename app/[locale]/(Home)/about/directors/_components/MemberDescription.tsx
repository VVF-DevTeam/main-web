import initTranslations from "@/app/i18n"

interface MemberDescriptionProps {
  title: string
  descriptions: string[]
  locale: string
}

const MemberDescription = async ({ title, descriptions, locale}: MemberDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript 
  const { t } = await initTranslations(locale, ['about', 'common'])

  return (
    <div className="my-auto flex basis-1/2 flex-col gap-y-8 text-[20px] font-light font-[Poppins]">
      <h1 className="text-center text-2xl font-bold tracking-widest">
        {title}
      </h1>
      <div className="flex flex-col gap-y-6">
        {descriptions.map((description, index) => (
          <p
            className="text-center tracking-wide text-gray-700 lg:text-pretty"
            key={index}
          >
    
            {t(description)}
          </p>
        ))}
      </div>
    </div>
  )
}

export default MemberDescription

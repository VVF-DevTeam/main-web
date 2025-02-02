import MemberDescription from './MemberDescription'
import MemberImage from './MemberImage'
import initTranslation from '@/app/i18n'
import { Separator } from '@/components/ui/separator'

interface OrgMemberCardProps {
  id: number
  descriptions: string[]
  imageUrl: string
  title: string
  locale: string
}

const OrgMemberCard = async ({
  id,
  descriptions,
  imageUrl,
  title,
  locale,
}: OrgMemberCardProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['about', 'common'])

  return (
    <div className="h-full w-full">
      {title === 'Andy Nguyen (Supervisor)' ? (
        <div className="px-6 py-14">
          <h1 className="text-center text-3xl font-semibold italic tracking-wide text-[#7f0000] md:text-4xl lg:text-5xl">
            {t('header-honorableMention-aboutUs')}
            <Separator className="mb-10 mt-2 w-2/3 place-self-center bg-[#7f0000] lg:mb-20 lg:w-1/2" />
          </h1>
        </div>
      ) : (
        ''
      )}
      {id % 2 === 0 ? (
        <div className="flex flex-col-reverse gap-x-6 gap-y-6 lg:grid lg:grid-cols-[50%_50%] lg:justify-items-center">
          <MemberDescription
            title={title}
            descriptions={descriptions}
            locale={locale}
          />
          <MemberImage imageUrl={imageUrl} />
        </div>
      ) : (
        <div className="flex flex-col gap-x-6 gap-y-6 lg:grid lg:grid-cols-[50%_50%] lg:justify-items-center">
          <MemberImage imageUrl={imageUrl} />
          <MemberDescription
            title={title}
            descriptions={descriptions}
            locale={locale}
          />
        </div>
      )}
    </div>
  )
}

export default OrgMemberCard

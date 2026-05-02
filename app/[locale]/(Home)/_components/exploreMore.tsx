import initTranslation from '@/app/i18n'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface ExploreMoreProps {
  locale: string
}

const ExploreMore = async ({ locale }: ExploreMoreProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-y-5 px-5 pb-10">
      <h2 className="web_h1 text-center">{t('exploreMoreSection-title')}</h2>
      <h3 className="web-body-regular text-center">{t('exploreMoreSection-description')}</h3>

      <div className="grid grid-cols-1 gap-6 pt-5 md:grid-cols-2">
        <article className="group relative min-h-[330px] overflow-hidden rounded-2xl">
          <Image
            src="https://drive.google.com/thumbnail?id=1PXKYQic5fhczpFJjMHPK4AyYTjSC-zya&sz=w1200"
            alt="Shop section"
            fill
            className="object-cover brightness-[0.45] transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-textColor-white">
            <h3 className="text-2xl font-bold">{t('exploreMoreSection-shop-title')}</h3>
            <p className="mt-2 max-w-md text-sm md:text-base">
              {t('exploreMoreSection-shop-description')}
            </p>
            <Button asChild className="mt-5 w-fit">
              <Link href="/shop">{t('learnMore')}</Link>
            </Button>
          </div>
        </article>

        <article className="group relative min-h-[330px] overflow-hidden rounded-2xl bg-bgColor-secondary200">
          <Image
            src="https://drive.google.com/thumbnail?id=1v9YmMiBjwuGXpmIDRDmDpraDuQQrr8b6"
            alt="Founding history section"
            fill
            className="object-cover brightness-[0.45] transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-textColor-white">
            <h3 className="text-2xl font-bold">{t('exploreMoreSection-founding-title')}</h3>
            <p className="mt-2 max-w-md text-sm md:text-base">
              {t('exploreMoreSection-founding-description')}
            </p>
            <Button asChild className="mt-5 w-fit">
              <Link href="/about/foundingHistory">{t('learnMore')}</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}

export default ExploreMore

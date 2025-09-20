// Components
import Image from 'next/image'
import IconTray from '@/app/[locale]/(Home)/events/_components/IconTray'
import AddReviewButton from '@/app/[locale]/(Home)/posts/_components/AddReviewButton'

// Libraries
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
interface ClassImageProps {
  imageUrl: string
  location: string
  startDate: Date
  endDate?: Date
  hosts: { name: string | null }[]
  title: string
  locale: string
  socialLinks: { platform: string; url: string }[] | null
}

const ClassImage = async ({
  imageUrl,
  location,
  startDate,
  hosts,
  title,
  locale,
  socialLinks,
}: ClassImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  // Get current user session
  const session = await auth()

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid-all-cols-2 mx-auto flex w-full flex-col p-6 pt-20 md:grid">
        {/* Left Image */}
        <div className="relative aspect-video w-full basis-1/2 md:h-[35vh] lg:h-[50vh]">
          <Image
            src={imageUrl}
            className="rounded-t-sm object-cover md:rounded-l-sm md:rounded-tr-none"
            fill
            alt="Event Image"
            sizes="(min-width: 1800px) 37.58vw, (min-width: 1380px) calc(10.5vw + 481px), (min-width: 780px) 44.83vw, calc(100vw - 48px)"
          />
        </div>

        {/* Right Content */}
        <div className="flex-col-center gap-y-4 rounded-b-sm bg-bgColor-black px-4 py-10 text-left text-textColor-white md:h-[35vh] md:gap-y-6 md:rounded-r-sm md:rounded-bl-none lg:h-[50vh] lg:pl-8 lg:pt-2">
          <span className="text-sm text-muted">
            {startDate.toLocaleDateString()} | {location}
          </span>
          <h2 className="-mt-3 mb-1 text-center text-4xl font-extrabold">
            {t(title)}
          </h2>
          <span>
            {t('hostedBy')}{' '}
            <span className="font-bold">
              {hosts.map((h) => h.name).join(', ')}
            </span>
          </span>
          <div>
            <IconTray
              iconList={
                socialLinks
                  ? JSON.parse(JSON.stringify(socialLinks)).map(
                      (
                        link: { platform: string; url: string },
                        index: number
                      ) => ({
                        id: String(index + 1),
                        name: link.platform,
                        icon: `/icons/${link.platform.toLowerCase()}-icon.svg`,
                        url: link.url,
                      })
                    )
                  : []
              }
              isLink={true}
              color="white"
            />
          </div>
        </div>
      </div>

      <div className="place-self-end p-6">
        <AddReviewButton user={session?.user} />
      </div>
    </div>
  )
}

export default ClassImage

// Components
import Image from 'next/image'
import IconTray from '@/app/[locale]/(Home)/events/_components/IconTray'
import AddReviewButton from '@/components/review/AddReviewButton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import ShareButton from '@/components/ui/share-button'

// Libraries
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
interface ClassImageProps {
  eventId: string
  hosts: { name: string | null; image: string | null }[]
  title: string
  locale: string
  socialLinks: { platform: string; url: string }[] | null
  reviewsCount: number
  seriesId?: string
}

const ClassImage = async ({
  eventId,
  hosts,
  title,
  locale,
  socialLinks,
  reviewsCount,
  seriesId,
}: ClassImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])
  // Get current user session
  const session = await auth()

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-y-8">
      {/* <div className="grid-all-cols-2 mx-auto flex w-full flex-col p-6 pt-10 md:grid">
        <div className="relative aspect-video w-full basis-1/2 md:h-[35vh] lg:h-[50vh]">
          <Image
            src={imageUrl}
            className="rounded-t-sm object-cover md:rounded-l-sm md:rounded-tr-none"
            fill
            alt="Event Image"
            sizes="(min-width: 1800px) 37.58vw, (min-width: 1380px) calc(10.5vw + 481px), (min-width: 780px) 44.83vw, calc(100vw - 48px)"
          />
        </div>

        <div className="flex-col-center gap-y-4 rounded-b-sm bg-bgColor-black px-4 py-10 text-left text-textColor-white md:h-[35vh] md:gap-y-6 md:rounded-r-sm md:rounded-bl-none lg:h-[50vh] lg:pl-8 lg:pt-2">
          <span className="text-sm text-muted">
            {startDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            | {location}
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
      </div> */}

      <div>
        <h1 className="web_h1 p-2">{t(title)}</h1>
      </div>

      <div className="flex-between flex items-center mb-5">
        {/* Hosted By */}
        <p className="web_h5 pl-2">
          {t('hostedBy')}{' '}
          {hosts.map((h, index) => (
            <span key={index} className="inline-flex items-center gap-1">
              {h.name}
              {h.image && (
                <Image
                  src={h.image}
                  alt={h.name || 'Host avatar'}
                  width={36}
                  height={36}
                  className="ml-[2px] inline-block rounded-full object-cover h-9 w-9"
                />
              )}
              {index < hosts.length - 1 && ', '}
            </span>
          ))}
        </p>

        {/* Share & Reviews */}
        <div className="col-span-2 flex flex-col items-end gap-2 place-self-end pr-6 md:col-span-1">
          {!seriesId && reviewsCount > 0 && (
            <Link
              href={`/posts?reviewEvent=${eventId}&reviewPage=1&redirectToReviewsSection=true`}
              className="group inline-flex items-center gap-1 whitespace-nowrap text-sm text-bgColor-brand900 hover:text-bgColor-brandDark900 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hidden sm:inline">
                {t('jumpToReviewsSection')}
              </span>
              <span className="sm:hidden">{t('jumpToReviews')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {seriesId && (
            <Link
              href={`/posts?reviewSeries=${seriesId}&reviewPage=1&redirectToReviewsSection=true`}
              className="group inline-flex items-center gap-1 whitespace-nowrap text-sm text-bgColor-brand900 hover:text-bgColor-brandDark900 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hidden sm:inline">
                {t('jumpToReviewsSectionSeries')}
              </span>
              <span className="sm:hidden">{t('jumpToReviews')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <div className="flex items-center gap-1">
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
                        icon: `/icons/${link.platform.toLowerCase()}-icon-event.svg`,
                        url: link.url,
                      })
                    )
                  : []
              }
              isLink={true}
              color="black"
              width={20}
              height={20}
              gap={8}
            />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShareButton />
                </TooltipTrigger>
                <TooltipContent className="bg-bgColor-black">
                  <p className="text-sm text-textColor-brand600">Share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AddReviewButton user={session?.user} useIcon={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassImage

import Image from 'next/image'
import IconTray from '@/app/[locale]/(Home)/events/_components/IconTray'
import { Event } from '@prisma/client'

interface ConcertHeadersProps {
  event: Event & {
    hosts: Array<{
      name: string | null
      image: string | null
    }>
  }
}

const ConcertHeaders = ({ event }: ConcertHeadersProps) => {
  const subImgUrls: string[] = event.subImgUrls
    ? JSON.parse(JSON.stringify(event.subImgUrls))
    : []
  const primarySubImg = subImgUrls[0]?.trim() ?? ''
  const secondarySubImg = subImgUrls[1]?.trim() ?? ''

  return (
    <div className="flex flex-col gap-y-4 py-10 md:py-12 lg:flex-row lg:items-center">
      {/* Event title and subtitle */}
      <div className="flex flex-col gap-y-4 px-6 md:px-12 lg:mt-4 lg:basis-1/2 xl:mt-6 xl:gap-y-7">
        {/* Event title */}
        <div className="flex flex-col font-bold uppercase text-5xl md:text-6xl lg:text-7xl xl:text-[84px] xl:font-extrabold xl:tracking-widest">
          {event.title?.split(' ').map((word, index) => (
            <span className="hidden lg:block" key={index}>
              {word}
            </span>
          ))}
          <span className="block lg:hidden">{event.title}</span>
        </div>
        {/* Event subtitle */}
        <p className="web-body-regular">
          <span className="uppercase">{event.subtitle}</span> <br />
          {event.hosts && event.hosts.length > 0 && (
            <span className="web-body-small">
              {' '}
              - Hosted by{' '}
              {event.hosts
                .map((host) => host.name)
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </p>

        {/* Social links */}
        <div>
          <IconTray
            iconList={
              event.socialLinks
                ? JSON.parse(JSON.stringify(event.socialLinks)).map(
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
          />
        </div>
      </div>

      {/* Event image — fixed 70vh column on lg matches production framing */}
      <div className="relative flex h-[50vh] w-full shrink-0 lg:h-[calc(70vh-6rem)] lg:basis-1/2 lg:self-center xl:h-[calc((70vh-6rem)*0.9)]">
        {/* large image */}
        <div
          className="relative z-1 h-full w-full max-[1020px]:max-w-none min-[1021px]:aspect-square min-[1021px]:w-full min-[1021px]:max-w-4xl"
        >
          <Image
            src={primarySubImg}
            fill
            alt="Event Image"
            className="object-cover max-[1020px]:rounded-none min-[1021px]:rounded-md"
          />
        </div>

        {/* small image — only when second sub image URL is set */}
        {secondarySubImg ? (
          <div className="z-2 absolute bottom-0 left-[-18%] right-0 top-[25%] hidden h-[45%] w-[35%] lg:block">
            <Image
              src={secondarySubImg}
              fill
              alt="Event Image"
              className="rounded-md object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ConcertHeaders

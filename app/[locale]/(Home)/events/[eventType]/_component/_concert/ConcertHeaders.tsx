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
  return (
    <div className="flex h-[70vh] flex-col justify-between gap-y-4 py-10 md:py-12 lg:flex-row">
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

      {/* Event image */}
      <div className="relative flex h-full w-full lg:basis-1/2 xl:h-[90%]">
        {/* large image */}
        <div className="z-1 h-full w-[50%] max-w-4xl lg:aspect-square">
          <Image
            src={
              event.subImgUrls
                ? JSON.parse(JSON.stringify(event.subImgUrls))[0]
                : ''
            }
            fill
            alt="Event Image"
            className="lg:rounded-md object-cover"
          />
        </div>
        {/* small image */}
        <div className="z-2 absolute bottom-0 left-[-15%] right-0 top-[25%] hidden h-[45%] w-[35%] lg:block">
          <Image
            src={
              event.subImgUrls
                ? JSON.parse(JSON.stringify(event.subImgUrls))[1]
                : ''
            }
            fill
            alt="Event Image"
            className="rounded-md object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default ConcertHeaders

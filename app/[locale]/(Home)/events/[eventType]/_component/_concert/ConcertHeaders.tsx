import Image from 'next/image'
import IconTray from '@/app/[locale]/(Home)/events/_components/IconTray'
import { Event } from '@prisma/client'

interface ConcertHeadersProps {
  event: Event
}

const ConcertHeaders = ({ event }: ConcertHeadersProps) => {
  return (
    <div className="flex h-[70vh] flex-col justify-between gap-y-4 py-10 md:py-12 lg:flex-row">
      {/* Event title and subtitle */}
      <div className="flex h-full basis-1/2 flex-col gap-y-4 px-6 md:px-12 lg:mt-4 xl:mt-6 xl:gap-y-7">
        <div className="flex flex-col text-3xl font-bold uppercase md:text-4xl lg:text-7xl xl:text-[84px] xl:font-extrabold xl:tracking-widest">
          {event.title?.split(' ').map((word, index) => (
            <span key={index}>{word}</span>
          ))}
        </div>
        <p className="md:text-md text-sm font-[400] uppercase">
          {event.subtitle}
        </p>
        <div>
          <IconTray 
            iconList={event.socialLinks ? JSON.parse(JSON.stringify(event.socialLinks)).map((link: { platform: string; url: string }, index: number) => ({
              id: String(index + 1),
              name: link.platform,
              icon: `/icons/${link.platform.toLowerCase()}-icon.svg`,
              url: link.url
            })) : []} 
            isLink={true} 
          />
        </div>
      </div>

      {/* Event image */}
      <div className="relative flex h-full w-full basis-1/2 xl:h-[90%]">
        {/* large image */}
        <div className="z-1 h-full w-[50%] max-w-4xl lg:aspect-square">
          <Image
            src={event.subImgUrls ? JSON.parse(JSON.stringify(event.subImgUrls))[0] : ''}
            fill
            alt="Event Image"
            className="rounded-md object-cover"
          />
        </div>
        {/* small image */}
        <div className="z-2 absolute bottom-0 left-[-15%] right-0 top-[25%] hidden h-[45%] w-[35%] lg:block">
          <Image
            src={event.subImgUrls ? JSON.parse(JSON.stringify(event.subImgUrls))[1] : ''}
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
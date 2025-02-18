import Image from 'next/image'
import IconTray from '@/app/[locale]/(Home)/events/_components/IconTray'
import Events from '@/app/[locale]/(Home)/events/_components/Events'
import { socialMediaIcons } from '@/lib/socialIcons'

const EventsPage = () => {
  const imageUrls = [
    { id: '1', url: 'https://drive.google.com/thumbnail?id=1IcCi98pC_IQ9IrE-J6tay3dAzKSXZshb&sz=w1000' },
    { id: '2', url: 'https://drive.google.com/thumbnail?id=1mMK7znhBvIrMP0w9SrK6gp32bHtZgoc-&sz=w500' },
  ]

  const eventList = [
    {
      id: '3',
      name: 'Friday Chill 3',
      thumbnail: 'https://drive.google.com/thumbnail?id=1mMK7znhBvIrMP0w9SrK6gp32bHtZgoc-&sz=w500',
      day: '13 Dec',
      location: 'Vancouver',
      end: 'True',
    },
    {
      id: '2',
      name: 'Friday Chill 2',
      thumbnail: 'https://drive.google.com/thumbnail?id=1IcCi98pC_IQ9IrE-J6tay3dAzKSXZshb&sz=w500',
      day: '25 Oct',
      location: 'Vancouver',
      end: 'True',
    },
    {
      id: '1',
      name: 'Friday Chill 1',
      thumbnail: 'https://drive.google.com/thumbnail?id=1HsFliVn1V3lBc3yMhFlOPG629zOj83Lg&sz=w500',
      day: '16 Aug',
      location: 'Vancouver',
      end: 'True',
    },
  ]
  return (
    <div className="w-full overflow-hidden">
      <div className="flex h-[70vh] flex-col justify-between gap-y-4 py-10 md:py-12 lg:flex-row">
        {/* Event title and description */}
        <div className="flex h-full basis-1/2 flex-col gap-y-4 px-6 md:px-12 lg:mt-4 xl:mt-6 xl:gap-y-7">
          <div className="flex flex-col text-3xl font-bold uppercase md:text-4xl lg:text-7xl xl:text-[84px] xl:font-extrabold xl:tracking-widest">
            <span>Friday</span>
            <span>Chill</span>
          </div>
          <p className="md:text-md text-sm font-[400] uppercase">
            Vietnamese Acoustic Shows
          </p>
          <div>
            <IconTray iconList={socialMediaIcons} isLink={true} />
          </div>
        </div>

        {/* Event image */}
        <div className="relative flex h-full w-full basis-1/2 xl:h-[90%]">
          {/* large image */}
          <div className="z-1 h-full w-[50%] max-w-4xl lg:aspect-square">
            <Image
              src={imageUrls[0].url}
              fill
              alt="Event Image"
              className="rounded-md object-cover"
            />
          </div>
          {/* small image */}
          <div className="z-2 absolute bottom-0 left-[-15%] right-0 top-[25%] hidden h-[45%] w-[35%] lg:block">
            <Image
              src={imageUrls[1].url}
              fill
              alt="Event Image"
              className="rounded-md object-cover"
            />
          </div>
        </div>
      </div>
      {/* Shows */}
      <Events events={eventList} />
    </div>
  )
}

export default EventsPage

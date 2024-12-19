import Image from 'next/image'

import IconTray from './_components/IconTray'
import Events from './_components/Events'
import { socialMediaIcons } from '@/lib/socialIcons'
const EventsPage = () => {
  const imageUrls = [
    { id: '1', url: '/sample-images/image1.jpg' },
    { id: '2', url: '/sample-images/image2.jpg' },
  ]

  const eventList = [
    {
      id: '1',
      name: 'Winter Tour1',
      thumbnail: '/sample-images/image1.jpg',
      day: '3 Jan',
      location: 'Vancouver',
    },
    {
      id: '2',
      name: 'Winter Tour2',
      thumbnail: '/sample-images/image2.jpg',
      day: '15 Dec',
      location: 'Vancouver',
    },
    {
      id: '3',
      name: 'Winter Tour3',
      thumbnail: '/sample-images/image3.jpg',
      day: '25 Dec',
      location: 'Toronto',
    },
  ]
  return (
    <div className="w-full overflow-hidden">
      <div className="flex h-[70vh] flex-col justify-between gap-y-4 py-10 md:py-12 lg:flex-row">
        {/* Event title and description */}
        <div className="flex h-full basis-1/2 flex-col gap-y-4 px-6 md:px-12 lg:mt-4 xl:mt-6 xl:gap-y-8">
          <div className="flex flex-col text-3xl font-bold uppercase md:text-4xl lg:text-7xl xl:text-[84px] xl:font-extrabold xl:tracking-widest">
            <span>Vancouver </span>
            <span> Winter</span>
            <span>Tour</span>
          </div>
          <p className="md:text-md text-sm font-[400] uppercase">
            A new album is on the horizon
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

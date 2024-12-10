import Image from "next/image";

import IconTray from "./_components/IconTray";
import Events from "./_components/Events";
import { socialMediaIcons } from "@/lib/socialIcons";
const EventsPage = () => {
  const imageUrls = [
    { id: "1", url: "/sample-images/image1.jpg" },
    { id: "2", url: "/sample-images/image2.jpg" },
  ];

  const eventList = [
    {
      id: "1",
      name: "Winter Tour1",
      thumbnail: "/sample-images/image1.jpg",
      day: "3 Jan",
      location: "Vancouver",
    },
    {
        id: "2",
        name: "Winter Tour2",
        thumbnail: "/sample-images/image2.jpg",
        day: "15 Dec",
        location: "Vancouver",
      },
      {
        id: "3",
        name: "Winter Tour3",
        thumbnail: "/sample-images/image3.jpg",
        day: "25 Dec",
        location: "Toronto",
      },
  ]
  return (
    <div className="w-full overflow-hidden">
      <div className="h-[70vh] flex flex-col gap-y-4 lg:flex-row justify-between py-10 md:py-12">
        {/* Event title and description */}
        <div className="h-full basis-1/2 flex flex-col gap-y-4 xl:gap-y-8 lg:mt-4 xl:mt-6 px-6 md:px-12">
          <div className="text-3xl uppercase lg:text-7xl xl:text-[84px] md:text-4xl font-bold xl:font-extrabold xl:tracking-widest flex flex-col">
            <span>Vancouver </span>
            <span> Winter</span>
            <span>Tour</span>
          </div>
          <p className="text-sm md:text-md uppercase font-[400]">
            A new album is on the horizon
          </p>
          <div>
            <IconTray iconList={socialMediaIcons} isLink={true} />
          </div>
        </div>

        {/* Event image */}
        <div className="flex xl:h-[90%] h-full w-full relative basis-1/2">
          {/* large image */}
          <div className="z-1 w-[50%] h-full max-w-4xl lg:aspect-square">
            <Image
              src={imageUrls[0].url}
              fill
              alt="Event Image"
              className="object-cover rounded-md"
            />
          </div>
          {/* small image */}
          <div className="z-2 hidden lg:block absolute h-[45%] w-[35%] left-[-15%] top-[25%] right-0 bottom-0">
            <Image
              src={imageUrls[1].url}
              fill
              alt="Event Image"
              className="object-cover rounded-md"
            />
          </div>
        </div>
      </div>
      {/* Shows */}
      <Events events={eventList}/>
    </div>
  );
};

export default EventsPage;


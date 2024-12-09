import React from "react";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
interface EventProps {
  day: string;
  name: string;
  location: string;
  thumbnail: string;
}

const Event = ({ day, location, thumbnail }: EventProps) => {
  return (
    <div className="py-6">
      <div className="w-full h-full flex flex-col gap-y-4 flex-start md:flex-row md:justify-between text-white items-center">
        <div className="flex gap-x-6 lg:gap-x-8 text-xl lg:text-2xl font-light items-center">
          <Image src={thumbnail} alt="Event Thumbnail" width={140} height={140} className="rounded-sm object-cover"/>
          <span>{day}</span>
          <span>{location}</span>
        </div>
        <button className="bg-[#1B171A] rounded-full hover:border-2 hover:border-[#EFB9A2] hover:bg-[#1B171A]/90 hover:text-white px-6 py-2 lg:px-8 lg:py-3 transition-all duration-75 ease-out">
          Buy Tickets
        </button>
      </div>
      <Separator className="bg-[#EFB9A2] my-4" />
    </div>
  );
};

export default Event;

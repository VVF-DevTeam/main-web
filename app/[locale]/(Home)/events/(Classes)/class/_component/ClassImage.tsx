import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ClassImageProps {
  imageUrl: string
  location: string
  startDate: Date
  endDate?: Date
  instructor: string
}

const ClassImage = ({
  imageUrl,
  location,
  startDate,
  instructor,
}: ClassImageProps) => {
  return (
    <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 p-6 md:grid-cols-2">
      <div className="relative aspect-video h-[30vh] w-full basis-1/2 md:h-[40vh] lg:h-[50vh]">
        <Image
          src={imageUrl}
          className="absolute object-cover"
          fill
          alt="Event Image"
        />
      </div>
      <div className="flex flex-col justify-center gap-y-4 bg-[#1e1924] pb-6 pl-4 text-left text-white lg:pl-8 md:h-[40vh] lg:h-[50vh] pt-2">
        <span className="text-sm text-muted">
          {startDate.toLocaleDateString()} | {location}
        </span>
        <h2 className="-mt-3 mb-1 text-3xl font-extrabold">{location}</h2>
        <span>
          A class by <span className="font-bold">{instructor}</span>
        </span>
        <Button className="w-fit bg-[#C54B3E] hover:bg-[#C54B3E]/80">
          Buy Ticket
        </Button>
      </div>
    </div>
  )
}

export default ClassImage

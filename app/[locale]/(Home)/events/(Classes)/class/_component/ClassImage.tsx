import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ClassImageProps {
  imageUrl: string
  location: string
  startDate: Date
  endDate?: Date
  instructor: string
  title:string
}

const ClassImage = ({
  imageUrl,
  location,
  startDate,
  instructor,
  title
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
      <div className="flex flex-col justify-center gap-y-4 bg-[#1e1924] pb-6 pl-4 pt-2 text-left text-white md:h-[40vh] lg:h-[50vh] lg:pl-8">
        <span className="text-sm text-muted">
          {startDate.toLocaleDateString()} | {location}
        </span>
        <h2 className="-mt-3 mb-1 text-3xl font-extrabold">{title}</h2>
        <span>
          A class by <span className="font-bold">{instructor}</span>
        </span>
        <a
          href="https://docs.google.com/forms/d/1u6MqzvwTdQhEwiwBNa1mf_IIEpWiKpK9dDWk-85Vv0E/viewform?edit_requested=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-fit bg-[#C54B3E] hover:bg-[#C54B3E]/80">
            Reserve Now
          </Button>
        </a>
      </div>
    </div>
  )
}

export default ClassImage

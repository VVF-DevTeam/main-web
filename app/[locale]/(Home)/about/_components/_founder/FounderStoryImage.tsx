// Libraries
import { cn } from '@/lib/utils'

// Components
import Image from 'next/image'

// Interfaces
interface FounderStoryImageProps {
  imageUrl: string
  id: number
}

// Main Component
const FounderStoryImage = ({ imageUrl, id }: FounderStoryImageProps) => {
  return (
    <div className="relative aspect-video w-full md:max-h-[500px] md:max-w-[600px]">
      <Image
        src={imageUrl}
        alt="Org Members"
        className= {cn(
          'absolute rounded-xl object-cover shadow-lg scroll-opacity-default',
          id % 2 === 0
            ? 'scroll-animation-fromRight'
            : 'scroll-animation-fromLeft'
        )}
        fill
        sizes="(min-width: 1460px) 600px, (min-width: 1040px) 42vw, (min-width: 780px) 600px, calc(100vw - 96px)"
      />
    </div>
  )
}

export default FounderStoryImage

// Components
import FounderStoryDescription from './FounderStoryDescription'
import FounderStoryImage from './FounderStoryImage'

//CSS & CSS Modules
import '@/lib/ui/css/scroll.css'

// Interfaces
interface FounderStoryCardProps {
  id: number
  description: string
  imageUrl: string
  locale: string
}

// Main Component
const FounderStoryCard = async ({
  id,
  description,
  imageUrl,
  locale,
}: FounderStoryCardProps) => {
  return (
    <div>
      {id % 2 === 0 ? (
        <div className="flex-center default-gap flex-col-reverse md:grid md:grid-cols-[40%_10%_40%] md:justify-items-center">
          <FounderStoryDescription
            description={description}
            locale={locale}
            id={id}
          />

          <div className="flex-center-md relative h-full w-full">
            {/* Dots */}
            <div className="absolute top-1/2 z-10 box-content h-2 w-2 rounded-full border-[5px] border-primary-foreground/95 bg-foreground max-md:left-[-30px]" />

            {/* Connect the dots */}
            <div className="w-[2px] bg-black md:h-[calc(100%+160px)]" />
          </div>
          <FounderStoryImage imageUrl={imageUrl} id={id} />
        </div>
      ) : (
        <div className="flex-col-center default-gap md:grid md:grid-cols-[40%_10%_40%] md:justify-items-center">
          <FounderStoryImage imageUrl={imageUrl} id={id} />
          <div className="flex-center-md relative h-10 w-full md:h-full">
            {/* Dots */}
            <div className="absolute top-1/2 z-10 box-content h-2 w-2 rounded-full border-[5px] border-primary-foreground/95 bg-foreground max-md:left-[-30px]" />

            {/* Connect the dots */}
            <div className="w-[2px] bg-black md:h-[calc(100%+160px)]" /> {/* 160 is the gap between the two items (gap-y-40) */}
          </div>
          <FounderStoryDescription
            description={description}
            locale={locale}
            id={id}
          />
        </div>
      )}
    </div>
  )
}

export default FounderStoryCard

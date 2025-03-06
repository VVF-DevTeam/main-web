// Components
import Image from 'next/image'

// Interfaces
interface MemberImageProps {
  imageUrl: string
}

// Main Component
const MemberImage = ({ imageUrl }: MemberImageProps) => {
  return (
    <div className="relative aspect-video w-full md:max-h-[500px] md:max-w-[600px]">
      <Image
        src={imageUrl}
        alt="Org Members"
        className="absolute rounded-xl object-cover shadow-lg"
        fill
        sizes="(min-width: 1460px) 600px, (min-width: 1040px) 42vw, (min-width: 780px) 600px, calc(100vw - 96px)"
      />
    </div>
  )
}

export default MemberImage

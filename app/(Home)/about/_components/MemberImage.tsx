import Image from 'next/image'

interface MemberImageProps {
  imageUrl: string
}

const MemberImage = ({ imageUrl }: MemberImageProps) => {
  return (
    <div className="relative aspect-video h-[400px] w-full basis-1/2 md:max-h-[500px] md:max-w-[600px]">
      <Image
        src={imageUrl}
        alt="Org Members"
        className="cover absolute rounded-xl shadow-lg"
        fill
      />
    </div>
  )
}

export default MemberImage

import Image from 'next/image'

interface MemberImageProps {
  imageUrl: string
}

const MemberImage = ({ imageUrl }: MemberImageProps) => {
  return (
    <div className="relative aspect-video h-[400px] w-full basis-1/2 place-self-center md:max-h-[500px] md:max-w-[600px]">
      <Image
        src={imageUrl}
        alt="Org Members"
        // To do change image
        className="object-cover absolute rounded-xl shadow-lg"
        fill
      />
    </div>
  )
}

export default MemberImage

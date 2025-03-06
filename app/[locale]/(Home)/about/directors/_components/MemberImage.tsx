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
        className="absolute rounded-xl object-cover shadow-lg"
        fill
        sizes="(min-width: 1460px) 600px, (min-width: 1040px) 42vw, (min-width: 780px) 600px, calc(100vw - 96px)"
      />
    </div>
  )
}

export default MemberImage

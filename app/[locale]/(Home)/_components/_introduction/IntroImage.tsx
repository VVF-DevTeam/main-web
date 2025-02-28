import Image from 'next/image'

interface IntroImageProps {
  imageUrl: string
  direction: string
}

const IntroImage = ({ imageUrl, direction }: IntroImageProps) => {
  return (
    <div
      className="relative aspect-video h-[300px] w-full basis-1/2 md:max-h-[500px] md:max-w-[400px]"
      style={{ placeSelf: direction === 'start' ? 'flex-start' : 'flex-end' }}
    >
      <Image
        src={imageUrl}
        alt="Intro Image"
        decoding="async"
        className="absolute rounded-sm object-cover shadow-lg"
        sizes="(min-width: 780px) 531px, calc(100vw - 46px)"
        fill
      />
    </div>
  )
}

export default IntroImage

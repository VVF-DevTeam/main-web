import Image from 'next/image'

interface IntroImageProps {
  imageUrl: string
  direction: string
}

const IntroImage = ({ imageUrl, direction }: IntroImageProps) => {
  return (
    <div
      className={`relative aspect-video h-[300px] w-full md:max-h-[500px] md:max-w-[400px] ${direction === 'start' ? 'place-self-start' : 'place-self-end'}`}
    >
      <Image
        src={imageUrl}
        alt="Intro"
        decoding="async"
        // To do change image
        className="absolute rounded-sm object-cover shadow-lg"
        sizes="(min-width: 780px) 531px, calc(100vw - 46px)"
        fill
      />
    </div>
  )
}

export default IntroImage

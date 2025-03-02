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
        alt="Intro Images of Viet Vibe Foundation"
        // To do change image
        className="absolute object-cover shadow-lg"
        fill
      />
    </div>
  )
}

export default IntroImage

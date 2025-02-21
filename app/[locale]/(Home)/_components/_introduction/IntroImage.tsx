import Image from 'next/image'

interface IntroImageProps {
  imageUrl: string
  direction: string
}

const IntroImage = ({ imageUrl, direction }: IntroImageProps) => {
  return (
    <div
      className={`relative aspect-video h-[300px] w-full md:max-h-[500px] md:max-w-[400px]`}
      style={{placeSelf: direction === 'start' ? 'flex-start' : 'flex-end'}}
    >
      <Image
        src={imageUrl}
        alt="Intro"
        // To do change image
        className="absolute object-cover shadow-lg"
        fill
      />
    </div>
  )
}

export default IntroImage

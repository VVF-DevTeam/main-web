import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

interface IntroCardProps {
  id: number
  descriptions: string[]
  imageUrl: string
  title: string
}

const IntroCard = ({ id, descriptions, imageUrl, title }: IntroCardProps) => {
  return (
    <div className="h-full w-full">
      {id % 2 === 0 ? (
        <div className="flex flex-col-reverse gap-x-20 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-end">
          <IntroDescription title={title} descriptions={descriptions} />
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className="flex flex-col gap-x-24 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-start">
          <IntroImage imageUrl={imageUrl} direction="end" />
          <IntroDescription title={title} descriptions={descriptions} />
        </div>
      )}
    </div>
  )
}

export default IntroCard

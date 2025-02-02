import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

interface IntroCardProps {
  id: number
  description: string
  imageUrl: string
  title: string,
  locale: string
}

const IntroCard = ({ id, description, imageUrl, title }: IntroCardProps) => {
  return (
    <div className="h-full w-full">
      {id % 2 === 0 ? (
        <div className="flex flex-col-reverse gap-x-20 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-end">
          <IntroDescription title={title} description={description} />
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className="flex flex-col gap-x-24 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-start">
          <IntroImage imageUrl={imageUrl} direction="end"/>
          <IntroDescription title={title} description={description} />
        </div>
      )}
    </div>
  )
}

export default IntroCard

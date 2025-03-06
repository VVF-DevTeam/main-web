import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

interface IntroCardProps {
  id: number
  description: string
  imageUrl: string
  title: string
  locale: string
}

const IntroCard = ({ id, description, imageUrl, title, locale }: IntroCardProps) => {
  return (
    <div className="mt-6 lg:mt-12">
      {id % 2 === 0 ? (
        <div className="flex flex-col-reverse gap-x-20 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-end">
          <IntroDescription title={title} description={description} locale={locale}/>
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className="flex flex-col gap-x-24 gap-y-6 md:grid md:grid-cols-[50%_50%] lg:justify-items-start">
          <IntroImage imageUrl={imageUrl} direction="end" />
          <IntroDescription title={title} description={description} locale={locale}/>
        </div>
      )}
    </div>
  )
}

export default IntroCard

// Components
import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

// Interfaces
interface IntroCardProps {
  id: number
  description: string
  imageUrl: string
  title: string,
  locale: string
}

// Main Component
const IntroCard = ({ id, description, imageUrl, title, locale }: IntroCardProps) => {
  return (
    <div className="mt-6 lg:mt-12">
      {id % 2 === 0 ? (
        <div className="flex-default grid-all-cols-2 flex-col-reverse gap-x-20 lg:justify-items-end">
          <IntroDescription title={title} description={description} locale={locale} />
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className="flex-col-default grid-all-cols-2 gap-x-20 lg:justify-items-start">
          <IntroImage imageUrl={imageUrl} direction="end" />
          <IntroDescription title={title} description={description} locale={locale} />
        </div>
      )}
    </div>
  )
}

export default IntroCard

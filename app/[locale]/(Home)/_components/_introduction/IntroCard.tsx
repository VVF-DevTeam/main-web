// Components
import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

// CSS Modules
import cardIntroItemStyles from '@/lib/ui/cssModules/introduction/cardIntroItem.module.css'

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
        <div className={`${cardIntroItemStyles.mainReverse} flexDefault`}>
          <IntroDescription title={title} description={description} />
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className={`${cardIntroItemStyles.main} flexDefault`}>
          <IntroImage imageUrl={imageUrl} direction="end"/>
          <IntroDescription title={title} description={description} />
        </div>
      )}
    </div>
  )
}

export default IntroCard

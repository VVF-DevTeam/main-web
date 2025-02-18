// Components
import { reverse } from 'dns'
import IntroDescription from './IntroDescription'
import IntroImage from './IntroImage'

// CSS Modules
import cardItemDefaultStyles from '@/lib/ui/cssModules/cards/cardItemDefault.module.css'
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
        <div className={`${cardItemDefaultStyles.mainReverse}`}>
          <IntroDescription title={title} description={description} />
          <IntroImage imageUrl={imageUrl} direction="start" />
        </div>
      ) : (
        <div className={`${cardItemDefaultStyles.main}`}>
          <IntroImage imageUrl={imageUrl} direction="end"/>
          <IntroDescription title={title} description={description} />
        </div>
      )}
    </div>
  )
}

export default IntroCard

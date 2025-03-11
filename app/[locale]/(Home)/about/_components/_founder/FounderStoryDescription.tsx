// Libraries
import initTranslations from '@/app/i18n'
import { cn } from '@/lib/utils'

// Interfaces
interface FounderStoryDescriptionProps {
  description: string
  locale: string
  id: number
}

// Main Component
const FounderStoryDescription = async ({
  description,
  locale,
  id,
}: FounderStoryDescriptionProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslations(locale, ['about', 'common'])

  return (
    <div className="flex-col-center my-auto gap-y-8">
      <div className="flex-col-center gap-y-6 text-center tracking-wide text-textColor lg:text-pretty lg:text-lg">
        <p
          className={cn(
            'scroll-opacity-default',
            id % 2 === 0
              ? 'scroll-animation-fromLeft'
              : 'scroll-animation-fromRight'
          )}
        >
          {t(description)}
        </p>
      </div>
    </div>
  )
}

export default FounderStoryDescription

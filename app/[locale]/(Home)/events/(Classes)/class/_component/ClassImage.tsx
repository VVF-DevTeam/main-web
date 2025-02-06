import Image from 'next/image'
import { Button } from '@/components/ui/button'
import initTranslation from '@/app/i18n'
interface ClassImageProps {
  imageUrl: string
  location: string
  startDate: Date
  endDate?: Date
  instructor: string
  title:string
  locale: string
}

const ClassImage = async ({
  imageUrl,
  location,
  startDate,
  instructor,
  title,
  locale
}: ClassImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 p-6 md:grid-cols-2">
      <div className="relative aspect-video h-[30vh] w-full basis-1/2 md:h-[40vh] lg:h-[50vh]">
        <Image
          src={imageUrl}
          className="absolute object-cover"
          fill
          alt="Event Image"
        />
      </div>
      <div className="flex flex-col justify-center gap-y-4 bg-[#242029] pb-6 pl-4 pt-2 text-left text-white md:h-[40vh] lg:h-[50vh] lg:pl-8">
        <span className="text-sm text-muted">
          {startDate.toLocaleDateString()} | {location}
        </span>
        <h2 className="-mt-3 mb-1 text-4xl font-extrabold font-[Poppins]">{t(title)}</h2>
        <span>
          {t('classBy-guitar')} <span className="font-bold">{instructor}</span>
        </span>
        <a
          href="https://docs.google.com/forms/d/1u6MqzvwTdQhEwiwBNa1mf_IIEpWiKpK9dDWk-85Vv0E/viewform?edit_requested=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-fit bg-[#C54B3E] hover:bg-[#C54B3E]/80">
            {t('reserve-button')}
          </Button>
        </a>
      </div>
    </div>
  )
}

export default ClassImage

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import initTranslation from '@/app/i18n'
interface ClassImageProps {
  imageUrl: string
  location: string
  startDate: Date
  endDate?: Date
  hosts: { name: string | null }[]
  title: string
  locale: string
}

const ClassImage = async ({
  imageUrl,
  location,
  startDate,
  hosts,
  title,
  locale,
}: ClassImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 p-6 md:grid-cols-2">
      <div className="relative aspect-video h-[30vh] w-full basis-1/2 md:h-[40vh] lg:h-[50vh]">
        <Image
          src={imageUrl}
          className="rounded-t-sm object-cover md:rounded-l-sm"
          fill
          alt="Event Image"
          sizes="(min-width: 1800px) 37.58vw, (min-width: 1380px) calc(10.5vw + 481px), (min-width: 780px) 44.83vw, calc(100vw - 48px)"
        />
      </div>
      <div className="flex flex-col justify-center gap-y-4 rounded-b-sm bg-[#1e1924] px-4 py-10 text-left text-white md:h-[40vh] md:gap-y-6 md:rounded-r-sm lg:h-[50vh] lg:pl-8 lg:pt-2">
        <span className="text-sm text-muted">
          {startDate.toLocaleDateString()} | {location}
        </span>
        <h2 className="-mt-3 mb-1 text-4xl font-extrabold">{t(title)}</h2>
        <span>
          {t('classBy-guitar')}{' '}
          <span className="font-bold">
            {hosts.map((h) => h.name).join(', ')}
          </span>
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

import React from 'react'
import Image from 'next/image'
import initTranslations from '@/app/i18n'
import { getTopRatedRecentEvents } from '@/lib/actions/review/reviewActions'

// Components
import { Separator } from '@/components/ui/separator'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Import scroll animation CSS
import '@/lib/ui/css/scroll.css'

// Interface & Type
interface TopRatedEventsProps {
  locale: string
}

// Top Rated Events Component
const TopRatedEvents = async ({ locale }: TopRatedEventsProps) => {
  const { t } = await initTranslations(locale, ['homePage', 'common'])
  const topEvents = await getTopRatedRecentEvents(5)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (!topEvents || topEvents.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 px-5 py-3 lg:py-5 text-center">
      {/* Header */}
      <div>
        <h2 className="header-font-black header-sub">
          {t('topRatedEvents')}
        </h2>
      </div>

      {/* Events Carousel Container */}
      <div className="w-full max-w-4xl overflow-hidden">
        <div className="flex animate-scroll-rtl gap-6 whitespace-nowrap">
          {/* Duplicate events for seamless loop */}
          {[...topEvents, ...topEvents].map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow duration-300"
            >
              {/* Event Image */}
              <div className="relative h-48 w-full">
                {event.imgUrl ? (
                  <Image
                    src={event.imgUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="p-4 text-left whitespace-normal">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 overflow-hidden" style={{ 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical' 
                }}>
                  {event.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {renderStars(event.averageRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {event.averageRating.toFixed(1)} ({event.reviewCount} reviews)
                  </span>
                </div>

                {/* Highest Rating Comment */}
                {event.highestRatingReview && (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">

                      <span className="font-medium"> Top review by {event.highestRatingReview.userName}</span>
                    </div>
                    <p className="italic text-gray-700 overflow-hidden break-words" style={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      &quot;{event.highestRatingReview.comment}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <Link href="/posts#top-rated-events">
        <Button className="w-36 p-3" variant={'default'}>
          {t('button-posts')}
        </Button>
      </Link>

      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brand md:w-1/2" />
    </div>
  )
}

export default TopRatedEvents

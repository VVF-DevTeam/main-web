'use client'
// Libraries
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

//Components
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getSeriesGalleries } from '@/lib/actions/event/getSeriesGalleries'

interface EventGalleryCarouselProps {
  imageUrls: string[]
  eventId: string
  autoSlide?: boolean
  duration?: number
  seriesId?: string
  /** Applied to the outer wrapper when the gallery is shown (avoids empty margin when hidden). */
  className?: string
}

type Direction = 'left' | 'right'

const EventGalleryCarousel: React.FC<EventGalleryCarouselProps> = ({
  imageUrls,
  eventId,
  autoSlide = false,
  duration = 7000,
  seriesId,
  className,
}) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')

  const normalizedImageUrls = Array.isArray(imageUrls) ? imageUrls : []

  const [galleryUrls, setGalleryUrls] = useState<string[]>(normalizedImageUrls)
  const [imageIndex, setImageIndex] = useState(0)

  /** Stable list by URL content so server parents can pass a new `[]` each render without refetching. */
  const stableImageUrls = useMemo(
    () => [...normalizedImageUrls],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fingerprint below; prop identity is intentionally ignored
    [normalizedImageUrls.join('\u0001')]
  )

  useEffect(() => {
    if (!seriesId || !eventId) {
      setGalleryUrls(stableImageUrls)
      return
    }
    let cancelled = false
    getSeriesGalleries({
      seriesId,
      eventId,
      imageUrls: stableImageUrls,
    }).then((merged) => {
      if (!cancelled) setGalleryUrls(merged)
    })
    return () => {
      cancelled = true
    }
  }, [seriesId, eventId, stableImageUrls])

  useEffect(() => {
    setImageIndex((i) => {
      if (galleryUrls.length === 0) return 0
      return i >= galleryUrls.length ? 0 : i
    })
  }, [galleryUrls])

  const changeImage = useCallback((direction: Direction) => {
    setImageIndex((prev) => {
      const len = galleryUrls.length
      if (len <= 1) return 0
      if (direction === 'left') {
        return prev === 0 ? len - 1 : prev - 1
      }
      return prev === len - 1 ? 0 : prev + 1
    })
  }, [galleryUrls.length])

  useEffect(() => {
    if (!autoSlide) {
      return
    }

    const timer = setTimeout(() => {
      changeImage('right')
    }, duration)

    return () => {
      clearTimeout(timer)
    }
  }, [autoSlide, duration, changeImage])

  /** No section (title + carousel) when there is nothing to show after local + optional series merge. */
  if (!galleryUrls.length) return null

  return (
    <div className={className}>
      {/* Header & Separator */}
      <div className="mx-auto w-full max-w-[1100px]">
        <h1 className="mb-2 text-left text-xl font-bold md:text-3xl lg:text-4xl">
          {t('headerGallery')}
        </h1>
      </div>

      {/* Image Carousel */}
      <div className="mx-auto w-[92vw] max-w-[1000px] overflow-hidden rounded-sm bg-black md:w-[85vw] lg:w-[75vw]">
        <div className="relative h-[50vh] w-full rounded-lg md:h-[60vh]">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${imageIndex * 100}%)` }}
          >
            {galleryUrls.map((img, index) => (
              <div key={index} className="relative h-full w-full flex-shrink-0">
                <Image
                  src={img}
                  alt={`Image ${index}`}
                  fill
                  sizes="md:75vw 90vw"
                  className="z-0 rounded-sm object-contain"
                />
              </div>
            ))}
          </div>
          {/* Navigation Buttons */}
          <div className="flex-between absolute inset-0 top-[10%] z-20 h-[80%] max-w-[90vw] px-4 md:max-w-[75vw]">
            <button aria-label="prev-image">
              <ArrowLeft
                className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand900 opacity-75 transition-all hover:bg-bgColor-brand400"
                onClick={() => changeImage('left')}
              />
            </button>
            <button aria-label="next-image">
              <ArrowRight
                className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand900 opacity-75 transition-all hover:bg-bgColor-brand400"
                onClick={() => changeImage('right')}
              />
            </button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {galleryUrls.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block h-3 w-3 rounded-full ${idx === imageIndex ? 'bg-bgColor-brand900' : 'bg-bgColor-gray500'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventGalleryCarousel

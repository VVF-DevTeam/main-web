'use client'
// Libraries
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//Components
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface EventGalleryCarouselProps {
  imageUrls: string[]
  autoSlide?: boolean
  duration?: number
}

type Direction = 'left' | 'right'

const EventGalleryCarousel: React.FC<EventGalleryCarouselProps> = ({
  imageUrls,
  autoSlide = false,
  duration = 7000,
}) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')

  const [imageIndex, setImageIndex] = useState(0)

  const changeImage = React.useCallback(
    (direction: Direction) => {
      let newIndex = 0

      if (direction === 'left') {
        newIndex = imageIndex === 0 ? imageUrls.length - 1 : imageIndex - 1
      }
      if (direction === 'right') {
        newIndex = imageIndex === imageUrls.length - 1 ? 0 : imageIndex + 1
      }

      setImageIndex(newIndex)
    },
    [imageIndex, imageUrls.length]
  )

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

  if (!imageUrls || imageUrls.length === 0) return null

  return (
    <div>
      {/* Header & Separator */}
      <div className="mx-auto w-full max-w-[1100px] px-6 md:px-12">
        <h1 className="mb-2 text-left text-xl font-bold md:text-3xl lg:text-4xl">
          {t('headerGallery')}
        </h1>
      </div>

      {/* Image Carousel */}
      <div className="mx-auto w-[90vw] max-w-[1000px] overflow-hidden rounded-sm bg-bgColor-black md:w-[75vw]">
        <div className="bg-bgColor-white relative h-[50vh] w-full rounded-lg md:h-[60vh]">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${imageIndex * 100}%)` }}
          >
            {imageUrls.map((img, index) => (
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
                className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand opacity-75 transition-all hover:bg-bgColor-brandLight"
                onClick={() => changeImage('left')}
              />
            </button>
            <button aria-label="next-image">
              <ArrowRight
                className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand opacity-75 transition-all hover:bg-bgColor-brandLight"
                onClick={() => changeImage('right')}
              />
            </button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {imageUrls.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block h-3 w-3 rounded-full ${idx === imageIndex ? 'bg-bgColor-blue' : 'bg-bgColor-gray'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventGalleryCarousel

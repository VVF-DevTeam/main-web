'use client'

// Libraries
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//Components
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Interfaces & Types
interface ImageCarouselProps {
  imageUrls: {
    id: string
    url: string
    height?: number
    width?: number
  }[]
  autoSlide?: boolean
  duration?: number
}
type Direction = 'left' | 'right'

// Main Component
const ImageCarousel = ({
  imageUrls,
  autoSlide = false,
  duration = 7000,
}: ImageCarouselProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')
  const [imageIndex, setImageIndex] = useState(0)
  const changeImage = (direction: Direction) => {
    let newIndex = 0

    if (direction === 'left') {
      newIndex = imageIndex === 0 ? imageUrls.length - 1 : imageIndex - 1
    }
    if (direction === 'right') {
      newIndex = imageIndex === imageUrls.length - 1 ? 0 : imageIndex + 1
    }

    setImageIndex(newIndex)
  }

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
  }, [autoSlide, duration, imageIndex])

  const totalwidth = `${imageUrls.length * 100}vw`

  return (
    <div>
      {/* Title & Separator */}
      <div className="flex-col-center default-gap lg:mt-6">
        <span className="header-font-black header-sub py-6">
          {t('header-achievement')}
        </span>
      </div>

      {/* Image Carousel */}
      <div className="relative h-[50vh] w-[400vw] md:h-[60vh] xl:h-[70vh]">
        <div className="flex h-full w-full items-center">
          {imageUrls.map((img) => (
            <div
              key={img.id}
              style={{
                width: totalwidth,
                transform: `translateX(-${imageIndex * 100}%)`,
              }}
              className="relative h-full transition-transform duration-500 ease-out"
            >
              <Image
                src={img.url}
                alt={`Image ${img.id}`}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex-between absolute inset-0 z-20 h-full max-w-[100vw] px-4">
          <button aria-label="prev-image">
            <ArrowLeft
              className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand transition-all hover:bg-bgColor-brandLight"
              onClick={() => changeImage('left')}
            />
          </button>
          <button aria-label="next-image">
            <ArrowRight
              className="h-11 w-11 rounded-full bg-bgColor-black p-2 text-textColor-brand transition-all hover:bg-bgColor-brandLight"
              onClick={() => changeImage('right')}
            />
          </button>
        </div>
      </div>
      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brand md:w-1/2" />
    </div>
  )
}

export default ImageCarousel

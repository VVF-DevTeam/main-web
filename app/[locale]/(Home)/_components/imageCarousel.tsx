'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
const ImageCarousel = ({
  imageUrls,
  autoSlide = false,
  duration = 7000,
}: ImageCarouselProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
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
      <div className="flexColCenter defaultGap">
        <Separator className="w-1/2 bg-[#7f0000]" />
        <span className="headerFontBlack headerSmall mb-7 py-6 italic">
          {t('header-achievement')}
        </span>
      </div>
      <div className="relative h-[75vh] w-[400vw]">
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
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flexBetween absolute inset-0 z-20 h-full max-w-[100vw] px-4">
          <button aria-label="prev-image">
            <ArrowLeft
              className="h-11 w-11 rounded-full bg-[#1B171A] p-2 text-[var(--brandColor)] transition-all hover:bg-[#EFB9A2]"
              onClick={() => changeImage('left')}
            />
          </button>
          <button aria-label="next-image">
            <ArrowRight
              className="h-11 w-11 rounded-full bg-[#1B171A] p-2 text-[var(--brandColor)] transition-all hover:bg-[#EFB9A2]"
              onClick={() => changeImage('right')}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCarousel

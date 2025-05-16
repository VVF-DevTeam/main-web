'use client'

// Libraries
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//Components
import Image from 'next/image'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

// Interfaces & Types
interface ImageCarouselProps {
  autoSlide?: boolean
  locale: string
  duration?: number
}
type Direction = 'left' | 'right'

// Main Component
const ImageCarousel = ({
  autoSlide = false,
  locale,
  duration = 7000,
}: ImageCarouselProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')

  // maximum 4 images, to increase please change the code
  const imageUrls = [
    {
      id: '1',
      url: 'https://drive.google.com/thumbnail?id=1AqJvPcGUzuZM5pTnLWI_TPR0iZhIu27M&sz=w2000',
      classUrl: `/${locale}/events/class/beginner-guitar-lessons-2025`,
      description: 'Beginner Guitar Lessons 2025',
    },
    {
      id: '2',
      url: 'https://drive.google.com/thumbnail?id=1PXOhQS85yPIJcKuTx6AMUF9zOVKzCYhm&sz=w2000',
      classUrl: `/${locale}/events/class/hiphop-dance-class-2025`,
      description: 'Hiphop Dance Class 2025',
    },
    {
      id: '3',
      url: 'https://drive.google.com/thumbnail?id=1LzN0Kouxwfy1R07qkX0NfxWByIHMtyGJ&sz=w3000',
      classUrl: `/${locale}/events/class/tennis-camp-2025`,
      description: 'Tennis Camp 2025',
    },

    {
      id: '4',
      url: 'https://drive.google.com/thumbnail?id=1QWFZ4Uhijftf5YT-7_KFU9jVJhPHT7PN&sz=w2000',
      classUrl: `/${locale}/events/class/tennis-camp-2025`,
      description: 'Tennis Camp 2025',
    },
    {
      id: '5',
      url: 'https://drive.google.com/thumbnail?id=1mMK7znhBvIrMP0w9SrK6gp32bHtZgoc-&sz=w2000',
      classUrl: `/${locale}/events/concert/fridaychill`,
      description: 'Friday Chill Series',
    },
  ]

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

  return (
    <div>
      {/* Title & Separator */}
      <div className="flex-col-center default-gap">
        <span className="header-font-black header-sub py-6">
          {t('header-achievement')}
        </span>
      </div>

      {/* Image Carousel */}
      <div className="ml-[5vw] w-[90vw] overflow-hidden rounded-sm md:ml-[12.5vw] md:w-[75vw]">
        {/* To increase the number of images, please the width according (75 | 60 * number of images) */}
        <div className="relative h-[50vh] w-[450vw] md:h-[60vh] md:w-[375vw] xl:h-[70vh]">
          <div className="flex h-full w-full items-center">
            {imageUrls.map((img) => (
              <div
                key={img.id}
                style={{
                  transform: `translateX(-${imageIndex * 100}%)`,
                }}
                className={`relative h-full transition-transform duration-500 ease-out md:w-[${imageUrls.length * 75}vw] w-[${imageUrls.length * 90}vw]`}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={img.url}
                    alt={`Image ${img.id}`}
                    fill
                    sizes="md:75vw 90vw"
                    className="z-0 rounded-sm object-cover"
                  />

                  {/* Description Link Overlay */}
                  <div className="pointer-events-auto absolute bottom-0 left-0 w-full bg-white/80 px-4 py-2 text-sm text-black md:text-base">
                    <Link
                      href={img.classUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group z-30 flex items-center whitespace-nowrap font-semibold hover:underline"
                    >
                      {img.description}
                      <span className="pl-1 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>
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
        </div>
      </div>

      {/* Separator */}
      <div className="mx-auto mt-12 w-2/3 border-b border-bgColor-brand md:w-1/2"></div>
    </div>
  )
}

export default ImageCarousel

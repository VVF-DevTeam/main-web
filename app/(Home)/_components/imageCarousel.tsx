'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

import { ArrowLeft, ArrowRight } from 'lucide-react'
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
  }, [imageIndex, autoSlide, duration])

  const totalwidth = `${imageUrls.length * 100}vw`

  return (
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
      <div className="absolute inset-0 z-20 flex h-full max-w-[100vw] items-center justify-between px-4">
        <button>
          <ArrowLeft
            className="h-11 w-11 rounded-full bg-[#1B171A] p-2 text-[#EFB9A2] transition-all hover:bg-[#EFB9A2] hover:text-[#620BC4]"
            onClick={() => changeImage('left')}
          />
        </button>
        <button>
          <ArrowRight
            className="h-11 w-11 rounded-full bg-[#1B171A] p-2 text-[#EFB9A2] transition-all hover:bg-[#EFB9A2] hover:text-[#620BC4]"
            onClick={() => changeImage('right')}
          />
        </button>
      </div>
    </div>
  )
}

export default ImageCarousel

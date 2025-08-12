import Image from 'next/image'
import React from 'react'

interface logoProps {
  height?: number
  width?: number
  src?: string
  color?: string
}
const CustomIcon = ({
  height = 120,
  width = 120,
  src = '/logo/main-logo.jpg',
  color = 'black',
}: logoProps) => {
  return (
    <Image
      src={src}
      alt="Org Logo"
      width={height}
      height={width}
      priority
      className={`${color === 'white' ? 'invert' : ''} duration-300 transition-all hover:brightness-110 hover:contrast-125 hover:drop-shadow-lg hover:scale-110`}
    />
  )
}

export default CustomIcon

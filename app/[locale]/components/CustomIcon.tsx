import Image from 'next/image'
import React from 'react'

interface logoProps {
  height?: number
  width?: number
  src?: string
  color?: string
  className?: string
}
const CustomIcon = ({
  height = 30,
  width = 30,
  src = '/logo/main-logo-1.png',
  color = 'black',
  className = '',
}: logoProps) => {
  return (
    <Image
      src={src}
      alt="Org Logo"
      width={height}
      height={width}
      priority
      className={`${color === 'white' ? 'invert' : ''} duration-300 transition-all hover:brightness-110 hover:contrast-125 hover:drop-shadow-lg hover:scale-110 ${className}`}
    />
  )
}

export default CustomIcon

import Image from "next/image";
import React from 'react'

interface logoProps {
  height?: number;
  width?: number;
  src?: string
}
const CustomIcon = ({height=120, width=120, src="/company-logo.svg"}: logoProps) => {
  return (
   <Image src={src} alt="Org Logo" width={height} height={width}/>
  )
}

export default CustomIcon

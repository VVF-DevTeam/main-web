import Image from "next/image";
import React from 'react'

interface logoProps {
  height?: number;
  width?: number;
}
const CompanyLogo = ({height=120, width=120}: logoProps) => {
  return (
   <Image src="/company-logo.svg" alt="Org Logo" width={height} height={width}/>
  )
}

export default CompanyLogo

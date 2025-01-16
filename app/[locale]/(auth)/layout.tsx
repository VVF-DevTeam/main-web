import React from 'react'
import Navbar from '../(Home)/_components/navbar'
type Props = {
  children: React.ReactNode
}

function layout({ children }: Props) {
  return (
    <div className="relative h-full min-h-fit w-full min-w-full bg-[#EFB9A2]/20">
      <Navbar />
      <div className="min-h-screen">{children}</div>
    </div>
  )
}

export default layout

import React from 'react'

// Interfaces & Types
interface JobHeaderProps {
  title: string
  summary: string
}

const JobHeader = ({ title, summary }: JobHeaderProps) => {
  return (
    <div className='flex-col-center gap-y-6 p-4 pt-32'>
      {/* Title */}
      <h1 className="web_h1 header-font-black">{title}</h1>
      <h2 className="text-lg tracking-wide md:max-w-[80vw] md:text-2xl lg:max-w-[60vw]">{summary}</h2>
    </div>
  )
}

export default JobHeader

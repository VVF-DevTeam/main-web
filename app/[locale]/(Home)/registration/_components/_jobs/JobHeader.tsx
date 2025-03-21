import React from 'react'

// Interfaces & Types
interface JobHeaderProps {
  title: string
  summary: string
}

const JobHeader = ({ title, summary }: JobHeaderProps) => {
  return (
    <div className='flex-col-center gap-y-6 p-4 pt-20'>
      {/* Title */}
      <h1 className="header-main header-font-black">{title}</h1>
      <h2 className="header-text header-font-black">{summary}</h2>
    </div>
  )
}

export default JobHeader

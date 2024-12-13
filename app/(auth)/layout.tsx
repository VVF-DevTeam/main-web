import React from 'react'

type Props = {
    children: React.ReactNode
}

function layout({children}: Props) {
  return (
    <div className='h-full min-h-screen w-screen bg-gray-500'>
        {children}
    </div>
  )
}

export default layout
import React from 'react'

const DirectorsSkeleton = () => {
  return (
    <div className="flex min-h-full min-w-full flex-col gap-y-40 p-6">
      <div className="h-[5vh] mx-auto w-[20vw] animate-pulse bg-gray-300"></div>

      <div className="flex flex-col gap-y-12">
        {/* 1st Row */}
        <div className="flex h-[30vh] animate-pulse gap-x-6 bg-gray-300">
          <div></div>
          <div></div>
        </div>
        {/* 2nd Row */}
        <div className="flex h-[30vh] animate-pulse gap-x-6 bg-gray-300">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  )
}

export default DirectorsSkeleton

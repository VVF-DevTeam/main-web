import React from 'react'

const EventsSkeleton = () => {
  return (
    <div className="flex min-h-screen w-full flex-col gap-y-12">
      {/* Hero Image skeleton */}
      <div className="h-[70vh] w-full animate-pulse rounded-md bg-gray-300"></div>

      {/* Intro cards skeleton */}
      <div className="mx-auto flex flex-col gap-y-6">
        <div className="mx-auto h-[5vh] w-[30vw] animate-pulse rounded-md bg-gray-300"></div>

        <div className="grid max-w-[1500px] grid-cols-3 gap-6">
          <div className="h-[15vh] w-[30vw] animate-pulse rounded-md bg-gray-300"></div>
          <div className="h-[15vh] w-[30vw] animate-pulse rounded-md bg-gray-300"></div>
          <div className="h-[15vh] w-[30vw] animate-pulse rounded-md bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}

export default EventsSkeleton

import React from 'react'

const PostsSkeleton = () => {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col justify-center gap-y-12 px-6 py-12 md:gap-y-16 lg:px-8 xl:px-36">
      <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
      <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
      <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
    </div>
  )
}

export default PostsSkeleton

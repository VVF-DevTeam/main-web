import React from 'react'

const PostCardSkeleton = () => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col p-6 py-12">
      {/* Header */}
      <div className="mb-3 h-[4vh] w-[23vw] animate-pulse rounded-md bg-gray-300"></div>
      <div className="mb-12 h-[2vh] w-[27vw] animate-pulse rounded-md bg-gray-300"></div>

      {/* Posts */}
      <div className="mx-auto flex w-full max-w-[1500px] flex-col justify-center gap-y-12 px-6 py-12 md:gap-y-16 lg:px-8 xl:px-36">
        <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
        <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
        <div className="h-[45vh] w-full animate-pulse rounded-md bg-gray-300 md:h-[19vh]"></div>
      </div>
    </div>
  )
}

export default PostCardSkeleton

// Libraries
import React from 'react'

// Components
import { Post, PostLikes, PostVisits } from '@prisma/client'
import PostCardHorizontal from './PostCardHorizontal'
import PostPagination from './PostPagination'

// Interfaces
interface PostListVerticalProps {
  posts: (Pick<Post, 'id' | 'title' | 'createdAt' | 'imgUrl' | 'summary'> & {
    _count: { postLikes: number; postVisits: number }
  } & {
    postLikes: PostLikes[]
  } & { postVisits: PostVisits[] })[]

  userId: string | null
  currentPage?: number
  totalPages?: number
  totalItems?: number
}

// Main Component
const PostListVertical = async ({
  posts,
  userId,
  currentPage,
  totalPages,
  totalItems,
}: PostListVerticalProps) => {

  return (
    <div className="width-max-default mx-auto flex w-[90%] flex-col gap-y-12 px-2 md:gap-y-16">
      {/* Posts Grid */}
      <div className="flex flex-col gap-y-12 md:gap-y-10">
        {posts &&
          posts.map((post) => (
            <PostCardHorizontal
              key={post.id}
              userId={userId}
              postLikes={post._count.postLikes}
              postViews={post._count.postVisits}
              hasLiked={!!post.postLikes.some((like) => like.userId === userId)}
              hasViewed={
                !!post.postVisits.some((view) => view.userId === userId)
              }
              id={post.id}
              title={post.title}
              summary={post.summary!}
              imageUrl={post.imgUrl!}
              createdAt={post.createdAt}
            />
          ))}
      </div>

      {/* Pagination */}
      {currentPage && totalPages && (
        <PostPagination
          currentPage={currentPage}
          totalPages={totalPages}
          showPageInfo={false}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}

export default PostListVertical

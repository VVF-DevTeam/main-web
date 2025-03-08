// Libraries
import React from 'react'

// Components
import { Post, PostLikes, PostVisits } from '@prisma/client'
import PostCard from './PostCard'

// Interfaces
interface PostListProps {
  posts: (Pick<Post, 'id' | 'title' | 'createdAt' | 'imgUrl' | 'summary'> & {
    _count: { postLikes: number; postVisits: number }
  } & {
    postLikes: PostLikes[]
  } & { postVisits: PostVisits[] })[]
  userId: string | null
}

// Main Component
const PostList = ({ posts, userId }: PostListProps) => {
  return (
    <div className="width-max-default flex-col-center mx-auto gap-y-12 px-6 py-12 md:gap-y-16 lg:px-8 xl:px-36">
      {posts &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            userId={userId}
            postLikes={post._count.postLikes}
            postViews={post._count.postVisits}
            hasLiked={!!post.postLikes.some((like) => like.userId === userId)}
            hasViewed={!!post.postVisits.some((view) => view.userId === userId)}
            id={post.id}
            title={post.title}
            summary={post.summary!}
            imageUrl={post.imgUrl!}
            createdAt={post.createdAt}
          />
        ))}
    </div>
  )
}

export default PostList

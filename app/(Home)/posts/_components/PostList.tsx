import React from 'react'
import { Post, PostLikes } from '@prisma/client'
import PostCard from './PostCard'

interface PostListProps {
  posts: (Post & { postLikes: PostLikes[] })[]
  userId: String | null
}

const PostList = ({ posts, userId }: PostListProps) => {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col justify-center gap-y-12 px-6 py-12 md:gap-y-16 lg:px-8 xl:px-36">
      {posts &&
        posts.map((post) => (
          <PostCard
            userId={userId}
            postLikes={post.postLikes.length}
            hasLiked={!!post.postLikes.some((like) => like.userId === userId)}
            key={post.id}
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

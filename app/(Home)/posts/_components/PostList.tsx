import React from 'react'
import { Post } from '@prisma/client'
import PostCard from './PostCard'

interface PostListProps {
  posts: Post[]
}

const PostList = ({ posts }: PostListProps) => {
  return (
    <div className="mx-auto w-full flex flex-col justify-center gap-y-12 px-6 py-12 md:gap-y-16 lg:px-8 xl:px-36 max-w-[1500px]">
      {posts &&
        posts.map((post) => (
          <PostCard
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

import React from 'react'
import { Post } from '@prisma/client'
import PostCard from './PostCard'

interface PostListProps {
  posts: Post[]
}

const PostList = ({ posts }: PostListProps) => {
  return (
    <div className="mx-auto flex flex-col justify-center gap-y-12 px-8 py-12 md:gap-y-20 lg:px-16 xl:max-w-[70vw]">
      {posts &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content!}
            imageUrl={post.imgUrl!}
            createdAt={post.createdAt}
          />
        ))}
    </div>
  )
}

export default PostList

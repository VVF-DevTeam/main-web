// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'

// Components
import { Post, PostLikes, PostVisits } from '@prisma/client'
import PostCardVertical from './PostCardVertical'
import PostPagination from './PostPagination'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Interfaces
interface PostListHorizontalProps {
  posts: (Pick<Post, 'id' | 'title' | 'createdAt' | 'imgUrl' | 'summary'> & {
    _count: { postLikes: number; postVisits: number }
  } & {
    postLikes: PostLikes[]
  } & { postVisits: PostVisits[] })[]

  userId?: string | null
  currentPage?: number
  totalPages?: number
  totalItems?: number
  fromHomePage?: boolean
  showNewBadge?: boolean
  showStats?: boolean
  locale: string
}

// Main Component
const PostListHorizontal = async ({
  posts,
  userId,
  currentPage,
  totalPages,
  totalItems,
  fromHomePage = false,
  showNewBadge = true,
  showStats = false,
  locale,
}: PostListHorizontalProps) => {
  const { t } = await initTranslation(locale, ['post', 'common'])
  // Determine if a post is "new" (created within last 7 days)
  const isPostNew = (createdAt: Date) => {
    if (!showNewBadge) return false
    const daysDiff = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysDiff <= 30
  }


  return (
    <div
      className={`flex w-full flex-col items-center gap-y-5 py-10 xl:pt-20 ${
        fromHomePage ? '-mt-12 bg-[#FEFAF4]' : ''
      }`}
    >
      {/* Top Border - 80% width */}
      {/* {fromHomePage && (
        <div className="mx-auto w-[70vw] border-t border-gray-200" />
      )} */}

      {/* Header */}
      {fromHomePage && (
        <div className="text-center">
          <h2 className="header-main mb-2">{t('articles')}</h2>
          <p className="text-base md:text-lg">{t('postHomepageDescription')}</p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="mx-auto flex flex-col gap-x-8 gap-y-6 p-6 pb-4 md:grid md:grid-cols-2 md:gap-y-12 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCardVertical
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
              isNew={isPostNew(post.createdAt)}
              showStats={showStats}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto p-4">
          <div className="flex items-center gap-x-2">
            <Image
              src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU&sz=w1000"
              alt="Penguin icon"
              width={50}
              height={50}
              className="inline-block align-middle"
            />
            <h2 className="text-sm text-textColor">No posts available</h2>
          </div>
        </div>
      )}

      {/* Pagination */}
      {currentPage && totalPages && totalPages > 0 && (
        <PostPagination
          currentPage={currentPage}
          totalPages={totalPages}
          showPageInfo={false}
          totalItems={totalItems}
        />
      )}

      {/* From Home Page button */}
      {fromHomePage && (
        <Button variant="default" className="px-8 py-6 text-base">
          <Link href="/posts">{t('readAllArticles')}</Link>
        </Button>
      )}
    </div>
  )
}

export default PostListHorizontal

import React from 'react'
import PostListVertical from './PostListVertical'
import { auth } from '@/auth'
import initTranslations from '@/app/i18n'
import { getPublishedPostsByTitlePaginated } from '@/lib/actions/post/getPosts'

interface PostsProps {
  locale: string
  title: string
  currentPage: number
  postsPerPage: number
}

const PublishedPosts = async ({
  locale,
  title,
  currentPage,
  postsPerPage,
}: PostsProps) => {
  const { t } = await initTranslations(locale, ['post', 'common'])
  const session = await auth()
  const paginationResult = await getPublishedPostsByTitlePaginated(
    title || '',
    currentPage,
    postsPerPage
  )

  return (
    <div className="flex flex-col gap-y-12 py-12">
      {/* Header */}
      <div className="flex flex-col gap-y-2 md:pl-8">
        <h2 className="header-font-black text-2xl font-bold">
          {t('postsHeader')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('postsDescription')}</p>
      </div>

      {/* Posts */}
      {paginationResult !== null && paginationResult.posts.length > 0 ? (
        <PostListVertical
          posts={paginationResult.posts}
          userId={session?.user?.id || null}
          currentPage={paginationResult.currentPage}
          totalPages={paginationResult.totalPages}
          totalItems={paginationResult.totalCount}
        />
      ) : (
        <p className="flex-center header-font-black mx-auto my-auto text-2xl text-muted-foreground">
          {t('noPost')}
        </p>
      )}
    </div>
  )
}

export default PublishedPosts

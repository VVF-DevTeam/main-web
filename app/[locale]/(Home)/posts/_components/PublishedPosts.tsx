import React from 'react'
import PostList from './PostList'
import { auth } from '@/auth'
import initTranslations from '@/app/i18n'
import { getPublishedPostsByTitle } from '@/lib/dbQueries/Post'

interface Postsprops {
  locale: string
  title: string
}

const PublishedPosts = async ({ locale, title }: Postsprops) => {
  const { t } = await initTranslations(locale, ['post', 'common'])
  const session = await auth()

  const publishedPosts = await getPublishedPostsByTitle(title || '')

  return (
    <>
      {publishedPosts !== null && publishedPosts.length > 0 ? (
        <PostList posts={publishedPosts} userId={session?.user?.id || null} />
      ) : (
        <p className="flex-center header-font-black mx-auto my-auto text-2xl text-muted-foreground">
          {t('noPost')}
        </p>
      )}
    </>
  )
}

export default PublishedPosts

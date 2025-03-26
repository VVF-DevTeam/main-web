import Link from 'next/link'

import { auth } from '@/auth'
import { getPublishedPostsByTitle } from '@/lib/actions/post/getPosts'
import { prisma } from '@/lib/db'
import { PlusCircle, ArrowRight } from 'lucide-react'
import SearchBox from '../../components/SearchBox'
import PostsSkeleton from '@/components/loadingSkeleton/PostsSkeleton'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import initTranslations from '@/app/i18n'
import PublishedPosts from './_components/PublishedPosts'
interface PostsProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    title: string
  }>
}

const Posts = async ({ params, searchParams }: PostsProps) => {
  const { locale } = await params
  const { title } = await searchParams
  const { t } = await initTranslations(locale, ['post', 'common'])

  // TODO: Abstract this code to a db function.
  const session = await auth()
  const publishedPosts = await getPublishedPostsByTitle(title || '')

  const userEmail = session?.user?.email

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail || '',
    },
  })

  let isAdmin = false
  if (user?.role === 'ADMIN') {
    isAdmin = true
  }

  return (
    <div>
      <div className="width-max-default flex-col-default mx-auto min-h-screen p-6 pt-12">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <h1 className="header-font-black header-sub lg:text-5xl">
            {t('header')}
          </h1>
          <p className="header-font-black md:text-md text-sm text-muted-foreground">
            {t('description-header')}
          </p>
        </div>

        {/* Search box */}

        <div className="mt-6 md:mt-10 lg:mt-12">
          <SearchBox placeholders={['Friday Chill', 'Guitar class', 'Tennis']} />
          <p className="mt-2 pl-4 text-sm text-muted-foreground">
            {publishedPosts !== null && publishedPosts.length > 0 ? (
              <>
                Showing {publishedPosts.length} posts{' '}
                {title && (
                  <>
                    with title{' '}
                    <span className="font-semibold">&quot;{title}&quot;</span>
                  </>
                )}
              </>
            ) : (
              'No results found'
            )}
          </p>
        </div>

        {/* Posts */}
        <Suspense key={title} fallback={<PostsSkeleton />}>
          <PublishedPosts title={title} locale={locale} />
        </Suspense>

        {/* Admin Buttons */}
        {isAdmin && (
          <div className="flex-end mt-6 w-full flex-wrap gap-x-4 pl-4 sm:px-6">
            <Link href="/posts/allPosts" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex-center gap-x-2 bg-bgColor-gray/15 p-6 text-textColor hover:bg-bgColor-gray/25 hover:text-textColor/90"
              >
                <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
                <span className="text-xl">{t('allPost')}</span>
              </Button>
            </Link>

            <Link href="/posts/createNewPost" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex-center gap-x-2 bg-bgColor-black p-6 text-textColor-white hover:bg-bgColor-black/90 hover:text-textColor-white/90"
              >
                <PlusCircle className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
                <span className="text-xl">{t('newPost')}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts

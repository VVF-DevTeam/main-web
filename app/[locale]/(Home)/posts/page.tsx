import Link from 'next/link'
import { PlusCircle, ArrowRight } from 'lucide-react'
import SearchBox from '../../components/SearchBox'
import PostsSkeleton from '@/components/loadingSkeleton/PostsSkeleton'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import initTranslations from '@/app/i18n'
import PublishedPosts from './_components/PublishedPosts'
import PaginatedSocialPosts from '../_components/_socialmediaposts/PaginatedSocialPosts'
import { roleCheck } from '@/lib/actions/user/roleCheck'

interface PostsProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    title: string
    page?: number
    socialPage?: number
  }>
}

const Posts = async ({ params, searchParams }: PostsProps) => {
  const { locale } = await params
  const { title, page, socialPage } = await searchParams
  const { t } = await initTranslations(locale, ['post', 'common'])

  // Pagination setup
  const currentPage = Number(page || 1)
  const postsPerPage = 4
  const currentSocialPage = Number(socialPage || 1)
  const socialPostsPerPage = 4

  // Check if user is admin
  const isAdmin = await roleCheck({ role: 'ADMIN' })

  return (
    <div>
      <div className="width-max-default flex-col-default mx-auto p-6 pt-12">
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
        <div className="mt-6 md:mt-5">
          <SearchBox
            placeholders={['Friday Chill', 'Guitar class', 'Tennis']}
          />
          {/* <p className="mt-2 pl-4 text-sm text-muted-foreground">
            {paginationResult !== null && paginationResult.posts.length > 0 ? (
              <>
                Showing {paginationResult.posts.length} of{' '}
                {paginationResult.totalCount} posts{' '}
                {title && (
                  <>
                    with title{' '}
                    <span className="font-semibold">&quot;{title}&quot;</span>
                  </>
                )}
                {paginationResult.totalPages > 1 && (
                  <>
                    {' '}
                    (page {paginationResult.currentPage} of{' '}
                    {paginationResult.totalPages})
                  </>
                )}
              </>
            ) : (
              'No results found'
            )}
          </p> */}
        </div>

        {/*Separator */}
        <div className="h-px w-full bg-bgColor-gray/15" />

        {/* Posts */}
        <div className="flex-col-default md:grid md:grid-cols-[55%_45%]">
          {/* Posts */}
          <div className="border-b border-bgColor-gray/15 md:border-r md:border-b-0">
            <Suspense
              key={`${title}-${currentPage}`}
              fallback={<PostsSkeleton />}
            >
              <PublishedPosts
                title={title}
                locale={locale}
                currentPage={currentPage}
                postsPerPage={postsPerPage}
              />
            </Suspense>
          </div>

          {/* Social Posts */}
          <Suspense
            key={`${title}-${currentSocialPage}`}
            fallback={<PostsSkeleton />}
          >
            <PaginatedSocialPosts
              content={title}
              locale={locale}
              currentPage={currentSocialPage}
              postsPerPage={socialPostsPerPage}
            />
          </Suspense>
        </div>

        {/*Separator */}
        <div className="h-px w-full bg-bgColor-gray/15" />

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

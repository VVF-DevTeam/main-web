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
import { auth } from '@/auth'
import AddReviewButton from '@/components/review/AddReviewButton'
import ReviewsDisplay from './_components/ReviewsDisplay'
import {
  getReviewsPaginated,
  getPublishedEventsForReviewsWithSearch,
  getPublishedSeriesForReviewsWithSearch,
} from '@/lib/actions/review/reviewActions'
import { convertStringToReviewRating } from '@/lib/utilFunctions/ratingUtils'
// import { ReviewRating } from '@prisma/client'
import ScrollToReviews from './_components/ScrollToReviews'
interface PostsProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    title: string
    page?: number
    socialPage?: number
    reviewPage?: number
    reviewSearch?: string
    reviewEvent?: string
    reviewRating?: string
    reviewSeries?: string
    redirectToReviewsSection?: boolean
  }>
}

const Posts = async ({ params, searchParams }: PostsProps) => {
  const { locale } = await params
  const {
    title,
    page,
    socialPage,
    reviewPage,
    reviewSearch,
    reviewEvent,
    reviewRating,
    reviewSeries,
    redirectToReviewsSection,
  } = await searchParams

  const { t } = await initTranslations(locale, ['post', 'common'])

  // Pagination setup
  const currentPage = Number(page || 1)
  const postsPerPage = 4
  const currentSocialPage = Number(socialPage || 1)
  const socialPostsPerPage = 4

  // Check if user is admin
  const isAdmin = Boolean(await roleCheck({ role: 'ADMIN' }))

  // Get current user session
  const session = await auth()

  // Get review search parameters
  const currentReviewPage = Number(reviewPage || 1)
  const currentReviewSearch = reviewSearch || ''
  const currentReviewEvent = reviewEvent || ''
  const currentReviewRating = reviewRating || ''
  const currentReviewSeries = reviewSeries || ''


  // Fetch reviews data on server side
  const reviewsResult = await getReviewsPaginated(
    currentReviewPage,
    6, // reviewsPerPage
    currentReviewSearch || undefined,
    currentReviewEvent === 'all' ? undefined : currentReviewEvent || undefined,
    currentReviewRating === 'all'
      ? undefined
      : convertStringToReviewRating(currentReviewRating),
    false,
    currentReviewSeries === 'all' ? undefined : currentReviewSeries || undefined
  )

  // Fetch events for review filtering (latest 15 events)
  const eventsForReviews = await getPublishedEventsForReviewsWithSearch(
    undefined,
    15
  )

  // Fetch series for review filtering
  const seriesForReviews = await getPublishedSeriesForReviewsWithSearch(
    undefined,
    15
  )

  return (
    <div>
      {redirectToReviewsSection && <ScrollToReviews />}
      <div className="width-max-default flex-col-default mx-auto p-6 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-y-2">
          <div className="flex flex-col gap-y-2">
            <h1 className="header-font-black header-sub lg:text-5xl">
              {t('header')}
            </h1>
            <p className="header-font-black md:text-md text-sm text-muted-foreground">
              {t('description-header')}
            </p>
          </div>
          {/* Quick navigation to reviews */}
          <div>
            <a
              href="#reviews-section"
              className="inline-flex items-center gap-1 text-sm text-bgColor-brand900 hover:text-bgColor-brandDark900 hover:underline group"
            >
              <span>Go to Reviews</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
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
        <div className="h-px w-full bg-bgColor-gray300" />

        {/* Posts */}
        <div className="flex-col-default md:grid md:grid-cols-[55%_45%]">
          {/* Posts */}
          <div className="flex flex-col border-b border-bgColor-gray300 md:border-b-0 md:border-r">
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

            {/* Admin Buttons */}
            {isAdmin && (
              <div className="flex-end mt-6 w-full flex-wrap gap-x-4 pl-4 sm:px-6">
                <Link href="/posts/allPosts" className="group mb-2 py-6">
                  <Button
                    variant={'ghost'}
                    className="flex-center gap-x-2 bg-bgColor-gray300 p-6 text-textColor-black hover:bg-bgColor-gray500"
                  >
                    <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-x-[2px]" />
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
        <div className="h-px w-full bg-bgColor-gray300" />

        {/* Reviews */}
        <div
          id="reviews-section"
          className="flex flex-col"
          style={{ scrollMarginTop: '90px' }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="header-font-black header-sub lg:text-5xl">
              {t('reviews')}
            </h2>
            <AddReviewButton user={session?.user} />
          </div>

          <Suspense fallback={<div>Loading reviews...</div>}>
            <ReviewsDisplay
              key={`reviews-${reviewsResult.totalCount}`}
              currentPage={currentReviewPage}
              reviewsPerPage={6}
              currentUserId={session?.user?.id}
              initialReviews={reviewsResult.reviews}
              totalPages={reviewsResult.totalPages}
              totalCount={reviewsResult.totalCount}
              initialEvents={eventsForReviews}
              initialSeries={seriesForReviews}
              initialSearchTerm={currentReviewSearch}
              initialSelectedEvent={currentReviewEvent}
              initialSelectedRating={currentReviewRating}
              initialSelectedSeries={currentReviewSeries}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Posts

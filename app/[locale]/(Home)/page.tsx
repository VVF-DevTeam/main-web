// import ImageCarousel from '@/app/[locale]/(Home)/_components/imageCarousel'
import Introduction from '@/app/[locale]/(Home)/_components/_introduction/Introduction'
// import Directors from '@/app/[locale]/(Home)/_components/directors'
// import Contact from '@/app/[locale]/(Home)/_components/contact'
// import JoinUs from '@/app/[locale]/(Home)/_components/joinUs'
// import TopRatedEvents from '@/app/[locale]/(Home)/_components/TopRatedEvents'
// import SocialMediaPosts from '@/app/[locale]/(Home)/_components/_socialmediaposts/SocialMediaPosts'
import EventListHorizontal from '@/app/[locale]/(Home)/events/_components/EventListHorizontal'
import ReviewByMember from '@/app/[locale]/(Home)/_components/reviewByMember'
import EventListVertical from '@/app/[locale]/(Home)/events/_components/EventListVertical'
import PostListHorizontal from '@/app/[locale]/(Home)/posts/_components/PostListHorizontal'
import MembershipBenefits from '@/app/[locale]/(Home)/_components/membershipBenefits'
import RegisterDoubleSection from '@/app/[locale]/(Home)/_components/registerDoubleSection'
import StudentBenefits from '@/app/[locale]/(Home)/_components/studentBenefits'
import ExploreMore from '@/app/[locale]/(Home)/_components/exploreMore'

// Libraries
import { Metadata } from 'next'

// Actions
import { getCachedReviewsPaginated } from '@/lib/actions/review/reviewActions'
import { convertStringToReviewRating } from '@/lib/utilFunctions/ratingUtils'
import { getPublishedEventsWithFilters } from '@/lib/actions/event/getEvent'
import { getCachedPostsPaginated } from '@/lib/actions/post/getPosts'

export const metadata: Metadata = {
  title: 'Homepage - Viet Vibe Foundation',
  description: 'Homepage - Viet Vibe Foundation',
  openGraph: {
    title: 'Homepage - Viet Vibe Foundation',
    description: 'Homepage - Viet Vibe Foundation',
    images: {
      url: '/logo/main-logo-white.jpg',
      alt: 'Homepage - Viet Vibe Foundation',
    },
  },
}

// Page is static - data fetching uses unstable_cache with revalidateTag for on-demand invalidation
// All data functions (events, posts, reviews) use unstable_cache with long cache times
// Cache is invalidated immediately via revalidateTag when content changes
export const dynamic = 'force-dynamic'

// Main Component
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Fetch all data in parallel for better performance
  const [
    upcomingThreeEvents,
    pastThreeEvents,
    paginatedReviews,
    paginatedPosts,
  ] = await Promise.all([
    getPublishedEventsWithFilters({
      numberOfEvents: 3,
      upcoming: true,
      finished: false,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      includeCategories: true,
    }),
    getPublishedEventsWithFilters({
      numberOfEvents: 3,
      upcoming: false,
      finished: true,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      includeCategories: true,
    }),
    getCachedReviewsPaginated(
      1,
      9,
      '',
      '',
      convertStringToReviewRating('5'),
      true
    ),
    getCachedPostsPaginated('', 1, 3),
  ])

  const reviews = paginatedReviews?.reviews || []
  const posts = paginatedPosts?.posts || []

  return (
    <div className="flex flex-col gap-y-12 overflow-hidden">
      <Introduction locale={locale} />
      <EventListHorizontal
        events={upcomingThreeEvents}
        locale={locale}
        totalItems={upcomingThreeEvents.length}
        fromHomePage={true}
      />
      <ReviewByMember locale={locale} reviews={reviews} />
      <EventListVertical
        events={pastThreeEvents}
        locale={locale}
        title="header-finishedEvent"
        fromHomePage={true}
      />
      <PostListHorizontal
        posts={posts}
        totalItems={posts.length}
        fromHomePage={true}
        showStats={false}
        locale={locale}
      />

      <MembershipBenefits locale={locale} />

      <RegisterDoubleSection locale={locale} />

      <StudentBenefits locale={locale} />

      <ExploreMore locale={locale} />

      {/* <ImageCarousel autoSlide={true} locale={locale} /> */}
      {/* <SocialMediaPosts locale={locale} /> */}
      {/* <TopRatedEvents locale={locale} /> */}
      {/* <JoinUs locale={locale} /> */}
      {/* <Directors locale={locale} /> */}
      {/* <Contact locale={locale} /> */}
    </div>
  )
}

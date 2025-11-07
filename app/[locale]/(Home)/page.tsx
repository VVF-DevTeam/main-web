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

// Libraries
import { Metadata } from 'next'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'
import { ReviewWithUserAndEvent } from '@/lib/actions/review/reviewActions'
import { CachedPostItem } from '@/lib/actions/post/getPosts'

// Actions
import { getReviewsPaginated } from '@/lib/actions/review/reviewActions'
import { convertStringToReviewRating } from '@/lib/utilFunctions/ratingUtils'
import { getPublishedEventsWithFilters } from '@/lib/actions/event/getEvent'
import { getPublishedPostsByTitlePaginated } from '@/lib/actions/post/getPosts'

export const metadata: Metadata = {
  title: 'Homepage - Viet Vibe Foundation',
  description: 'Homepage - Viet Vibe Foundation',
  openGraph: {
    title: 'Homepage - Viet Vibe Foundation',
    description: 'Homepage - Viet Vibe Foundation',
  },
}

// Caches
let upcomingEventsCache: {
  data: (Event & {
    categories: EventCategory[]
  })[]
  timestamp: number
  locale: string
  fetchLimit?: number // Track how many events we attempted to fetch
} | null = null

let pastEventsCache: {
  data: (Event & {
    categories: EventCategory[]
  })[]
  timestamp: number
  locale: string
  fetchLimit?: number // Track how many events we attempted to fetch
} | null = null

let reviewsCache: {
  data: ReviewWithUserAndEvent[]
  timestamp: number
  locale: string
  fetchLimit?: number // Track how many reviews we attempted to fetch
} | null = null

let postsCache: {
  data: CachedPostItem[]
  timestamp: number
  locale: string
  fetchLimit?: number // Track how many posts we attempted to fetch
} | null = null

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Main Component
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const nowTimestamp = Date.now()

  // Get all events with caching
  const isCacheUpcomingEventValid =
    upcomingEventsCache &&
    upcomingEventsCache.locale === locale &&
    nowTimestamp - upcomingEventsCache.timestamp < CACHE_DURATION

  // Get upcoming three events with caching
  let upcomingThreeEvents
  if (isCacheUpcomingEventValid) {
    upcomingThreeEvents = upcomingEventsCache!.data
  } else {
    upcomingThreeEvents = await getPublishedEventsWithFilters({
      numberOfEvents: 3,
      upcoming: true,
      finished: false,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      includeCategories: true,
    })
    // Update cache
    upcomingEventsCache = {
      data: upcomingThreeEvents,
      timestamp: nowTimestamp,
      locale,
    }
  }

  // Get past three events with caching
  let pastThreeEvents
  const isCachePastEventValid =
    pastEventsCache &&
    pastEventsCache.locale === locale &&
    nowTimestamp - pastEventsCache.timestamp < CACHE_DURATION
  if (isCachePastEventValid) {
    pastThreeEvents = pastEventsCache!.data
  } else {
    pastThreeEvents = await getPublishedEventsWithFilters({
      numberOfEvents: 3,
      upcoming: false,
      finished: true,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      includeCategories: true,
    })
    // Update cache
    pastEventsCache = {
      data: pastThreeEvents,
      timestamp: nowTimestamp,
      locale,
    }
  }

  // Get all reviews with caching
  const isCacheReviewValid =
    reviewsCache &&
    reviewsCache.locale === locale &&
    nowTimestamp - reviewsCache.timestamp < CACHE_DURATION
  let reviews
  if (isCacheReviewValid) {
    reviews = reviewsCache!.data
  } else {
    const paginatedReviews = await getReviewsPaginated(
      1,
      9,
      '',
      '',
      convertStringToReviewRating('5'),
      true
    )
    reviews = paginatedReviews.reviews

    // Update cache
    reviewsCache = {
      data: reviews,
      timestamp: nowTimestamp,
      locale,
    }
  }

  // Get all posts with caching
  const isCachePostValid =
    postsCache &&
    postsCache.locale === locale &&
    nowTimestamp - postsCache.timestamp < CACHE_DURATION
  let posts
  if (isCachePostValid) {
    posts = postsCache!.data
  } else {
    const paginatedPosts = await getPublishedPostsByTitlePaginated('', 1, 3)
    posts = paginatedPosts!.posts
    // Update cache
    postsCache = {
      data: posts,
      timestamp: nowTimestamp,
      locale,
    }
  }

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
      {/* <ImageCarousel autoSlide={true} locale={locale} /> */}
      {/* <SocialMediaPosts locale={locale} /> */}
      {/* <TopRatedEvents locale={locale} /> */}
      {/* <JoinUs locale={locale} /> */}
      {/* <Directors locale={locale} /> */}
      {/* <Contact locale={locale} /> */}
    </div>
  )
}

'use server'

import { prisma } from '@/lib/db'
import { Prisma, ReviewRating } from '@prisma/client'

export interface CreateReviewData {
  userId: string
  eventId?: string
  rating: string
  comment: string
  anonymous?: boolean
  imageLink?: string
}

export interface ReviewWithUserAndEvent {
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
  eventId: string | null
  rating: ReviewRating
  comment: string
  anonymous: boolean
  imageLink: string | null
  user: {
    name: string | null
    image: string | null
  } | null
  event: {
    title: string
  } | null
}

export interface ReviewsPaginationResult {
  reviews: ReviewWithUserAndEvent[]
  totalCount: number
  totalPages: number
  currentPage: number
}

const RatingToString = {
  '1': ReviewRating.One,
  '2': ReviewRating.Two,
  '3': ReviewRating.Three,
  '4': ReviewRating.Four,
  '5': ReviewRating.Five,
}

// Create a new review
export async function createReview(data: CreateReviewData) {
  try {
    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        eventId: data.eventId || null,
        rating: RatingToString[data.rating as keyof typeof RatingToString] || ReviewRating.One,
        comment: data.comment,
        anonymous: data.anonymous || false,
        imageLink: data.imageLink || null,
      }
    })

    return { success: true, review }
  } catch (error) {
    console.error('Error creating review:', error)
    return { success: false, message: 'Failed to create review' }
  }
}

// Get reviews with pagination, search, and filtering
export async function getReviewsPaginated(
  page: number = 1,
  reviewsPerPage: number = 6,
  searchTerm?: string,
  eventId?: string,
  rating?: ReviewRating
): Promise<ReviewsPaginationResult> {
  try {
    const skip = (page - 1) * reviewsPerPage

    // Build where clause
    const whereClause: Prisma.ReviewWhereInput = {}
    
    if (searchTerm) {
      whereClause.OR = [
        { comment: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { event: { title: { contains: searchTerm, mode: 'insensitive' } } },
      ]
    }

    if (eventId) {
      whereClause.eventId = eventId
    }

    if (rating) {
      whereClause.rating = rating
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          eventId: true,
          rating: true,
          comment: true,
          anonymous: true,
          imageLink: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          event: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: reviewsPerPage,
      }),
      prisma.review.count({ where: whereClause }),
    ])

    const totalPages = Math.ceil(totalCount / reviewsPerPage)

    return {
      reviews,
      totalCount,
      totalPages,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error getting reviews:', error)
    return {
      reviews: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}

// Get all published events for review filtering
export async function getPublishedEventsForReviews() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc',
      },
    })

    return events
  } catch (error) {
    console.error('Error getting published events for reviews:', error)
    return []
  }
}

// Get published events with search and limit for review filtering
export async function getPublishedEventsForReviewsWithSearch(
  searchTerm?: string,
  limit: number = 15
) {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        ...(searchTerm && {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        }),
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        updatedAt: 'desc', // Latest events first
      },
      take: limit,
    })

    return events
  } catch (error) {
    console.error('Error getting published events for reviews with search:', error)
    return []
  }
}

// Update a review (owner only)
export async function updateReview(reviewId: string, data: { comment: string; rating: ReviewRating; anonymous?: boolean; imageLink?: string | null }) {
  try {
    await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        comment: data.comment,
        rating: data.rating,
        anonymous: data.anonymous,
        imageLink: data.imageLink,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating review:', error)
    return { success: false, message: 'Failed to update review' }
  }
}

// Delete a review (admin only)
export async function deleteReview(reviewId: string) {
  try {
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting review:', error)
    return { success: false, message: 'Failed to delete review' }
  }
}

// Get top 5 recent events with highest ratings
export async function getTopRatedRecentEvents(limit: number = 5) {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        Review: {
          some: {} // Only events that have at least one review
        }
      },
      select: {
        id: true,
        title: true,
        imgUrl: true,
        startDate: true,
        location: true,
        createdAt: true,
        Review: {
          select: {
            rating: true,
            comment: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Get recent events first
      },
      take: 50, // Get more events to calculate ratings from
    })

    // Calculate average rating and find highest rating comment for each event
    const eventsWithRatings = events.map(event => {
      const reviewsWithRatings = event.Review.map(review => {
        const ratingValue = (() => {
          switch (review.rating) {
            case 'One': return 1
            case 'Two': return 2
            case 'Three': return 3
            case 'Four': return 4
            case 'Five': return 5
            default: return 0
          }
        })()
        
        return {
          ...review,
          ratingValue
        }
      })
      
      const ratings = reviewsWithRatings.map(review => review.ratingValue)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
        : 0

      // Find the review with the highest rating (first one if there are ties)
      const highestRatingReview = reviewsWithRatings.reduce((highest, current) => {
        return current.ratingValue > highest.ratingValue ? current : highest
      }, reviewsWithRatings[0])

      return {
        ...event,
        averageRating,
        reviewCount: ratings.length,
        highestRatingReview: highestRatingReview ? {
          rating: highestRatingReview.ratingValue,
          comment: highestRatingReview.comment,
          userName: highestRatingReview.user?.name || 'Anonymous'
        } : null,
      }
    })

    // Sort by average rating (highest first) and take top 5
    const topRatedEvents = eventsWithRatings
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)

    return topRatedEvents
  } catch (error) {
    console.error('Error getting top rated recent events:', error)
    return []
  }
}


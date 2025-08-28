'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, Search, Filter, Trash2, Edit } from 'lucide-react'
import {
  deleteReview,
  updateReview,
  getPublishedEventsForReviewsWithSearch,
} from '@/lib/actions/review/reviewActions'
import { ReviewWithUserAndEvent } from '@/lib/actions/review/reviewActions'
import { toast } from 'sonner'
import { ReviewRating } from '@prisma/client'
import { useTranslation } from 'react-i18next'
import useDebounce from '@/hooks/useDebounce'
import Image from 'next/image'

interface ReviewsDisplayProps {
  currentPage: number
  reviewsPerPage: number
  currentUserId?: string
  initialReviews: ReviewWithUserAndEvent[]
  totalPages: number
  totalCount: number
  initialEvents: Event[]
  initialSearchTerm: string
  initialSelectedEvent: string
  initialSelectedRating: string
}

interface Event {
  id: string
  title: string
}

const ReviewsDisplay = ({
  currentPage,
  reviewsPerPage,
  currentUserId,
  initialReviews,
  totalPages: initialTotalPages,
  totalCount: initialTotalCount,
  initialEvents,
  initialSearchTerm,
  initialSelectedEvent,
  initialSelectedRating,
}: ReviewsDisplayProps) => {
  console.log(reviewsPerPage)
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('post')

  const reviews = initialReviews
  const totalPages = initialTotalPages
  const totalCount = initialTotalCount
  const loading = false
  const events = initialEvents
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [selectedEvent, setSelectedEvent] = useState(initialSelectedEvent)
  const [selectedRating, setSelectedRating] = useState(initialSelectedRating)
  const [filteredEvents, setFilteredEvents] = useState(events)
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editComment, setEditComment] = useState('')
  const [editRating, setEditRating] = useState<ReviewRating | null>(null)

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Track if this is the initial render
  const isInitialRenderRef = useRef(true)

  // Helper function to convert ReviewRating enum to number
  const ratingEnumToNumber = (rating: ReviewRating): number => {
    switch (rating) {
      case ReviewRating.One:
        return 1
      case ReviewRating.Two:
        return 2
      case ReviewRating.Three:
        return 3
      case ReviewRating.Four:
        return 4
      case ReviewRating.Five:
        return 5
      default:
        return 0
    }
  }

  const router = useRouter()
  const searchParams = useSearchParams()

  // Update local state when URL parameters change
  useEffect(() => {
    const urlSearchTerm = searchParams.get('reviewSearch') || ''
    const urlEvent = searchParams.get('reviewEvent') || ''
    const urlRating = searchParams.get('reviewRating') || ''

    // Update local state with URL parameters
    setSearchTerm(urlSearchTerm)
    setSelectedEvent(urlEvent)
    setSelectedRating(urlRating)
  }, [searchParams])

  const handleSearch = useCallback(
    (resetPage: boolean = true) => {
      const params = new URLSearchParams(searchParams)

      // Only reset to first page when it's a filter change, not pagination
      if (resetPage) {
        params.set('reviewPage', '1')
      }

      // Handle search term - set if exists, delete if empty
      if (debouncedSearchTerm) {
        params.set('reviewSearch', debouncedSearchTerm)
      } else {
        params.delete('reviewSearch')
      }

      // Handle event filter
      if (selectedEvent && selectedEvent !== 'all') {
        params.set('reviewEvent', selectedEvent)
      } else {
        params.delete('reviewEvent')
      }

      // Handle rating filter
      if (selectedRating && selectedRating !== 'all') {
        params.set('reviewRating', selectedRating)
      } else {
        params.delete('reviewRating')
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [debouncedSearchTerm, selectedEvent, selectedRating, searchParams, router]
  )

  // Track previous filter values to detect actual filter changes
  const prevFiltersRef = useRef({
    searchTerm: initialSearchTerm,
    selectedEvent: initialSelectedEvent,
    selectedRating: initialSelectedRating,
  })

  // Auto-trigger search when filters change (but not when page changes)
  useEffect(() => {
    // Skip the initial render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      // Update the ref with current values
      prevFiltersRef.current = {
        searchTerm: debouncedSearchTerm,
        selectedEvent,
        selectedRating,
      }
      return
    }

    // Check if any filter actually changed
    const filtersChanged =
      prevFiltersRef.current.searchTerm !== debouncedSearchTerm ||
      prevFiltersRef.current.selectedEvent !== selectedEvent ||
      prevFiltersRef.current.selectedRating !== selectedRating

    if (filtersChanged) {
      // Update the ref with new values
      prevFiltersRef.current = {
        searchTerm: debouncedSearchTerm,
        selectedEvent,
        selectedRating,
      }

      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleSearch(true) // Reset page when filters change
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [debouncedSearchTerm, selectedEvent, selectedRating, handleSearch])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedEvent('all')
    setSelectedRating('all')
    const params = new URLSearchParams(searchParams)
    params.delete('reviewSearch')
    params.delete('reviewEvent')
    params.delete('reviewRating')
    params.set('reviewPage', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams)
      params.set('reviewPage', page.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // Handle event search
  const handleEventSearch = useCallback(
    async (searchTerm: string) => {
      if (searchTerm === '') {
        setFilteredEvents(events)
      } else {
        const filtered = await getPublishedEventsForReviewsWithSearch(
          searchTerm,
          15
        )
        setFilteredEvents(filtered)
      }
    },
    [events]
  )

  const handleEditReview = (review: ReviewWithUserAndEvent) => {
    setEditingReview(review.id)
    setEditComment(review.comment)
    setEditRating(review.rating)
  }

  const handleSaveEdit = async (reviewId: string) => {
    if (!editComment.trim() || !editRating) {
      toast.error(t('fillAllFields'))
      return
    }

    try {
      const { success } = await updateReview(reviewId, {
        comment: editComment.trim(),
        rating: editRating,
      })

      if (success) {
        toast.success(t('reviewUpdated'))
        setEditingReview(null)
        setEditComment('')
        setEditRating(null)
        // Refresh the page to get updated data
        router.refresh()
      } else {
        toast.error(t('reviewUpdateFailed'))
      }
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error(t('reviewUpdateError'))
    }
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditComment('')
    setEditRating(null)
  }

  const handleDeleteReview = async (review: ReviewWithUserAndEvent) => {
    // Check if user is admin or the owner of the review
    if (currentUserId !== review.userId) return

    try {
      const { success } = await deleteReview(review.id)
      if (success) {
        toast.success(t('reviewDeleted'))
        // Refresh the page to get updated data
        router.refresh()
      } else {
        toast.error(t('deleteFailed'))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error(t('deleteError'))
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">{t('loadingReviews')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-textColor-white">
              {t('searchReviews')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder') || ''}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-textColor-white">
              {t('filterByEvent')}
            </label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder={t('allEvents') || ''} />
              </SelectTrigger>
              <SelectContent>
                <div className="pb-2">
                  <Input
                    type="search"
                    autoComplete="off"
                    placeholder="Search for event (if not shown in list)"
                    value={eventSearchTerm}
                    onChange={(e) => {
                      setEventSearchTerm(e.target.value)
                    }}
                    onKeyDown={async (e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        await handleEventSearch(eventSearchTerm)
                      }
                    }}
                  />
                </div>
                <SelectItem value="all">{t('allEvents')}</SelectItem>
                {filteredEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-textColor-white">
              {t('filterByRating')}
            </label>
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger>
                <SelectValue placeholder={t('allRatings') || ''} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRatings')}</SelectItem>
                <SelectItem value="5">5 {t('stars')}</SelectItem>
                <SelectItem value="4">4 {t('stars')}</SelectItem>
                <SelectItem value="3">3 {t('stars')}</SelectItem>
                <SelectItem value="2">2 {t('stars')}</SelectItem>
                <SelectItem value="1">1 {t('stars')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 dark:text-textColor dark:bg-bgColor-black">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2 dark:text-textColor dark:hover:text-white"
            >
              <Filter className="h-4 w-4" />
              {t('clear')}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {t('showingResults')
          .replace('{count}', reviews.length.toString())
          .replace('{total}', totalCount.toString())}
        {(debouncedSearchTerm ||
          (selectedEvent && selectedEvent !== 'all') ||
          (selectedRating && selectedRating !== 'all')) && (
          <>
            <span className="ml-2">{t('filteredResults')} </span>
            <span className="ml-2 font-semibold">
              {t('averageRating')}:{' '}
              {(reviews.reduce(
                (acc, review) => acc + ratingEnumToNumber(review.rating),
                0
              ) / reviews.length).toFixed(1)}
            </span>
          </>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {debouncedSearchTerm ||
          (selectedEvent && selectedEvent !== 'all') ||
          (selectedRating && selectedRating !== 'all') ? (
            <p>{t('noReviewsMatch')}</p>
          ) : (
            <p>{t('noReviewsYet')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingReview === review.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      {/* Rating selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 cursor-pointer ${
                                editRating &&
                                ratingEnumToNumber(editRating) >= star
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                              onClick={() => {
                                const ratingMap = {
                                  1: ReviewRating.One,
                                  2: ReviewRating.Two,
                                  3: ReviewRating.Three,
                                  4: ReviewRating.Four,
                                  5: ReviewRating.Five,
                                }
                                setEditRating(
                                  ratingMap[star as keyof typeof ratingMap]
                                )
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment input */}
                      <Input
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder={
                          t('enterComment') || 'Enter your comment...'
                        }
                        className="w-full"
                      />

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(ratingEnumToNumber(review.rating))}
                          <span className="ml-1 text-sm text-gray-600">
                            {ratingEnumToNumber(review.rating)}/5
                          </span>
                        </div>
                        {review.event && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {review.event.title}
                          </span>
                        )}
                      </div>

                      <p className="mb-2 text-gray-800 dark:text-textColor-white">{review.comment}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {t('by')} {review.user?.name || t('anonymous')}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                            {review.user?.image ? (
                              <Image
                                src={review.user.image}
                                alt={review.user?.name || 'User'}
                                className="h-full w-full object-cover"
                                width={24}
                                height={24}
                              />
                            ) : (
                              <Image
                                src={
                                  'https://drive.google.com/thumbnail?id=1Vjy12B-hkodyEouCprguvMvICCg2o5Ab&sz=w2000'
                                }
                                alt={review.user?.name || 'User'}
                                className="h-full w-full object-cover"
                                width={24}
                                height={24}
                              />
                            )}
                          </div>
                        </div>
                        <span>
                          {new Date(review.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {currentUserId === review.userId &&
                  editingReview !== review.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='dark:bg-gray-800 dark:text-white dark:hover:bg-gray-600'
          >
            {t('previous')}
          </Button>

          <span className="text-sm text-gray-600">
            {t('page')
              .replace('{current}', currentPage.toString())
              .replace('{total}', totalPages.toString())}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='dark:bg-gray-800 dark:text-white dark:hover:bg-gray-600'
          >
            {t('next')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReviewsDisplay

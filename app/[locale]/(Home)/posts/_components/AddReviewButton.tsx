'use client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReviewRating } from '@prisma/client'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPublishedEventsForReviews } from '@/lib/actions/review/reviewActions'
import { createReview } from '@/lib/actions/review/reviewActions'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

const addReviewSchema = z.object({
  eventId: z.string().optional(),
  rating: z.string().min(1, 'Please select a rating'),
  comment: z.string().min(1, 'Please share your experience with us, thank you!'),
})

// Event Interfaces
interface Event {
  id: string
  title: string
}

// Modal for adding a review
const AddReviewModal = ({
  form,
  events,
  setShowAddReviewModal,
  onSubmit,
}: {
  form: UseFormReturn<AddReviewFormValues>
  events: Event[]
  setShowAddReviewModal: (show: boolean) => void
  onSubmit: (data: AddReviewFormValues) => void
}) => {
  // handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowAddReviewModal(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => form.setValue('rating', String(i + 1))}
      />
    ))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Review</h2>
          <button
            onClick={() => setShowAddReviewModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form for adding a review */}
        <Form {...form} key="add-review-form">
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-4">
              {/* Event */}
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No specific event</SelectItem>
                          {events.map((event: Event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {renderStars(Number(field.value) || 0)}
                        <span className="ml-2 text-sm text-gray-600">
                          {field.value ? `${field.value}/5` : 'Select rating'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience..."
                        className="min-h-[100px]"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="mt-4">
              Submit Review
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

type AddReviewFormValues = z.infer<typeof addReviewSchema>

interface AddReviewButtonProps {
  user?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
}

const AddReviewButton = ({ user }: AddReviewButtonProps) => {
  const [showAddReviewModal, setShowAddReviewModal] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const router = useRouter()

  // get events for review
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const publishedEvents = await getPublishedEventsForReviews()
        setEvents(publishedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEvents()
  }, [])

  // Form
  const form = useForm<AddReviewFormValues>({
    resolver: zodResolver(addReviewSchema),
    defaultValues: {
      eventId: 'none',
      rating: '',
      comment: '',
    },
  })

  // onSubmit
  const onSubmit = async (data: AddReviewFormValues) => {
    try {
      // Check if user is logged in
      if (!user?.id) {
        toast.error('Error', {
          description: 'You must be logged in to submit a review',
          style: {
            color: '#ef4444',
          },
        })
        return
      }

      const reviewData = {
        userId: user.id,
        eventId: data.eventId === 'none' ? undefined : data.eventId,
        rating: Number(data.rating) as unknown as ReviewRating,
        comment: data.comment,
      }

      const { success, message } = await createReview(reviewData)
      if (success) {
        toast.success('Success', {
          description: 'Review submitted successfully',
          style: {
            color: '#22c55e',
          },
        })
        setShowAddReviewModal(false)
        form.reset({
          eventId: 'none',
          rating: '',
          comment: '',
        })
        router.refresh()
      } else {
        toast.error('Error', {
          description: message || 'Something went wrong',
          style: {
            color: '#ef4444',
          },
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Error', {
        description: 'Something went wrong',
        style: {
          color: '#ef4444',
        },
      })
    }
  }

  return (
    <>
      <Button onClick={() => setShowAddReviewModal(true)} disabled={events.length === 0}>
        Add Review
      </Button>
      {showAddReviewModal && (
        <AddReviewModal
          form={form}
          events={events}
          setShowAddReviewModal={setShowAddReviewModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

export default AddReviewButton

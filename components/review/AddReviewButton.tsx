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
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { FiEdit2 } from 'react-icons/fi'
import axios from 'axios'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from 'react-i18next'

const addReviewSchema = z.object({
  eventId: z.string().optional(),
  rating: z.string().min(1, 'Please select a rating'),
  comment: z
    .string()
    .min(1, 'Please share your experience with us, thank you!'),
  anonymous: z.boolean().optional(),
  image: z.string().optional(),
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
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('post')
  const [imagePreview, setImagePreview] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setIsImageLoading(true)
      const file = event.target.files[0]
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await axios.post('/api/reviews/images', formData)
        if (response.status === 200) {
          setImagePreview(response.data.url)
          form.setValue('image', response.data.url)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image')
      }
      setIsImageLoading(false)
    }
  }

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
          <h2 className="text-2xl font-bold">{t('addReview')}</h2>
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
                          <SelectItem value="none">
                            No specific event
                          </SelectItem>
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

              <div className="flex justify-between">
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

                {/* Anonymous */}
                <FormField
                  control={form.control}
                  name="anonymous"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anonymous</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm text-gray-600">
                            {field.value ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

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

            {/* Review Image Upload */}
            <span>Image (Optional)</span>
            <div className="flex flex-col">
              <label className="relative h-32 w-32 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 hover:bg-gray-50">
                {imagePreview ? (
                  <div className="flex items-center justify-center">
                    <Image
                      src={imagePreview}
                      alt="Review"
                      fill
                      className="rounded-lg object-cover"
                    />
                    <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-500 p-2 transition-colors hover:bg-blue-600">
                      <FiEdit2 className="h-3 w-3 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                        disabled={isImageLoading}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">
                      Add Photo
                    </p>
                    <p className="text-xs text-gray-500">Optional</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageLoading}
                />
              </label>
              {isImageLoading && (
                <p className="mt-2 text-sm text-blue-500">Uploading...</p>
              )}
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
  useIcon?: boolean
}

const AddReviewButton = ({ user, useIcon = false }: AddReviewButtonProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('post')
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
      anonymous: false,
      image: '',
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
        anonymous: data.anonymous,
        imageLink: data.image,
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
          image: '',
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

  const openAddReviewModal = () => {
    if (user?.id) {
      setShowAddReviewModal(true)
    } else {
      toast.error('Error', {
        description: (
          <div className="flex flex-col gap-2">
            <span>Please log in to submit a review, thank you.</span>
            <button
              onClick={() => router.push('/signIn')}
              className="text-left font-medium text-blue-500 underline hover:text-blue-700"
            >
              Click here to sign in
            </button>
          </div>
        ),
        style: {
          color: '#ef4444',
        },
      })
    }
  }

  return (
    <>
      {!useIcon ? (
        <Button onClick={openAddReviewModal} disabled={events.length === 0}>
          {t('addReview')}
        </Button>
      ) : (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="group p-1"
                onClick={openAddReviewModal}
                disabled={events.length === 0}
              >
                <Image
                  src="/icons/edit-review-icon.svg"
                  alt="Edit Review"
                  width={20}
                  height={20}
                  className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                  unoptimized
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-bgColor-black">
              <p className="text-sm text-textColor-brand600">{t('addReview')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

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

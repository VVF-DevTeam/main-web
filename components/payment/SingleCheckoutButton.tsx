'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { ArrowRight } from 'lucide-react'
import { PaymentType } from '@prisma/client'
import { FormResponses } from './PaymentInfoForm'
import { EventCheckoutDialog } from './EventCheckoutDialog'
import { getEventForm, EventFormData } from '@/lib/actions/event/getEventForm'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface SingleCheckoutButtonProps {
  stripePriceId: string
  stripeProductId: string
  eventKeyName?: string
  userId?: string | null
  eventId?: string
  buttonText: string
  type: PaymentType
  numberSession?: number | null
  email: string
  seatNumber?: string
  eventTicketId?: string
  mainUserPhone?: string
  mainUserName?: string
  isMembership?: boolean
}

export default function SingleCheckoutButton({
  stripePriceId,
  stripeProductId,
  eventKeyName,
  userId,
  eventId,
  buttonText,
  type,
  numberSession,
  email,
  seatNumber,
  eventTicketId,
  mainUserPhone = '',
  mainUserName = '',
  isMembership = false,
}: SingleCheckoutButtonProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['event', 'membership'])
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null)
  const [guestInfo, setGuestInfo] = useState<{
    guestName: string
    guestEmail: string
    guestPhone: string
    otherGuests: Array<{ name: string; email: string; phone: string }>
  } | null>(null)

  // Fetch event form data if eventId is provided
  useEffect(() => {
    const fetchEventForm = async () => {
      if (!eventId) return

      try {
        const formData = await getEventForm(eventId)
        setEventFormData(formData)
      } catch (error) {
        console.error('Error fetching event form:', error)
        setEventFormData(null)
      }
    }

    fetchEventForm()
  }, [eventId])

  const handleCheckout = async (
    priceId: string,
    guestInfo: {
      guestName: string
      guestEmail: string
      guestPhone: string
      otherGuests: Array<{ name: string; email: string; phone: string }>
    },
    formResponses?: FormResponses
  ) => {
    const stripe = await stripePromise

    try {
      setIsLoading(true)

      // Prepare form responses for API
      const formattedFormResponses = formResponses && Object.keys(formResponses).length > 0
        ? {
            responses: Object.entries(formResponses).map(([questionId, answer]) => {
              const question = eventFormData?.questions.find(q => q.id === questionId)
              return {
                questionId,
                question: question?.question || '',
                answer,
                questionType: question?.type || '',
                required: question?.required || false,
                options: question?.options || [],
              }
            }),
          }
        : null

      const { data } = await axiosInstance.post(
        '/api/payment/checkout-sessions/create',
        {
          stripePriceId: priceId,
          stripeProductId: stripeProductId,
          eventKeyName: eventKeyName,
          userId: userId || '',
          eventId: eventId,
          type: type,
          numberSession: numberSession,
          email: guestInfo.guestEmail || email,
          seatNumber: seatNumber,
          eventTicketId: eventTicketId,
          // Guest information
          guestName: guestInfo.guestName,
          guestPhone: guestInfo.guestPhone,
          // Event form responses
          ...(formattedFormResponses && { formResponses: formattedFormResponses }),
        }
      )
      const result = await stripe!.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        toast.error('Error', {
          description: `Stripe redirect error: ${result.error.message}`,
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error('Error', {
          description:
            error.response?.data?.message ||
            'A network or server error occurred. Please try again.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      } else if (error instanceof Error) {
        toast.error('Error', {
          description: error.message || 'Unexpected error occurred.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      } else {
        toast.error('Error', {
          description:
            'Unexpected error occurred. Please contact our developer team for support.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    // For membership checkout, skip dialog and go straight to Stripe payment
    if (isMembership) {
      const memberGuestInfo = {
        guestName: mainUserName || '',
        guestEmail: email,
        guestPhone: mainUserPhone || '',
        otherGuests: [] as Array<{ name: string; email: string; phone: string }>,
      }

      // Directly start Stripe checkout for membership
      handleCheckout(stripePriceId, memberGuestInfo)
      return
    }

    // Show checkout dialog for non-membership flows
    setShowCheckoutDialog(true)
  }

  const handleGuestFormSubmit = (guestInfo: {
    guestName: string
    guestEmail: string
    guestPhone: string
    otherGuests: Array<{ name: string; email: string; phone: string }>
  }) => {
    // Save guest info
    setGuestInfo(guestInfo)

    // If there's no event form, proceed directly to checkout
    if (!eventFormData || !eventFormData.questions || eventFormData.questions.length === 0) {
      setShowCheckoutDialog(false)
      handleCheckout(stripePriceId, guestInfo)
    }
  }

  const handleEventFormSubmit = (formResponses: FormResponses) => {
    setShowCheckoutDialog(false)
    if (guestInfo) {
      handleCheckout(stripePriceId, guestInfo, formResponses)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-fit">
        <Button onClick={handleButtonClick} className="group" disabled={isLoading} size="sm">
          {buttonText === 'become-member'
            ? t(`membership:${buttonText}`)
            : t(buttonText)}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Checkout Dialog with Event Form Support */}
      <EventCheckoutDialog
        open={showCheckoutDialog}
        onOpenChange={setShowCheckoutDialog}
        onGuestFormSubmit={handleGuestFormSubmit}
        onEventFormSubmit={handleEventFormSubmit}
        totalGuestRequired={1}
        userId={userId || null}
        userInfo={{
          email: email || null,
          phone: mainUserPhone || null,
          name: mainUserName || null,
        }}
        eventFormData={eventFormData}
        isLoading={isLoading}
        t={t}
      />
    </>
  )
}

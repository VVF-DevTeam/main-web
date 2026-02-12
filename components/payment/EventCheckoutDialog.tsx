'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import GuestInfoForm from './GuestInfoForm'
import PaymentInfoForm from './PaymentInfoForm'
import { EventFormData } from '@/lib/actions/event/getEventForm'
import Link from 'next/link'

type CheckoutStep = 'guest' | 'event'

interface EventCheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuestFormSubmit: (guestInfo: {
    guestName: string
    guestEmail: string
    guestPhone: string
    otherGuests: Array<{ name: string; email: string; phone: string }>
  }) => void
  onEventFormSubmit: (formResponses: Record<string, string>) => void
  totalItemCount: number
  userId: string | null
  userInfo: {
    email?: string | null
    phone?: string | null
    name?: string | null
  } | null
  eventFormData: EventFormData | null
  isLoading: boolean
  t: (key: string, params?: any) => string
}

export function EventCheckoutDialog({
  open,
  onOpenChange,
  onGuestFormSubmit,
  onEventFormSubmit,
  totalItemCount,
  userId,
  userInfo,
  eventFormData,
  isLoading,
  t,
}: EventCheckoutDialogProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('guest')

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      // Reset to guest step after a short delay to avoid visible step change during close animation
      setTimeout(() => setCurrentStep('guest'), 300)
    }
  }

  const handleGuestFormSubmit = (
    representativeGuest: { name: string; email: string; phone: string },
    otherGuests: Array<{ name: string; email: string; phone: string }>
  ) => {
    // Convert to the format expected by parent
    const guestInfo = {
      guestName: representativeGuest.name,
      guestEmail: representativeGuest.email,
      guestPhone: representativeGuest.phone,
      otherGuests,
    }
    
    // If event form exists, move to event form step
    if (eventFormData && eventFormData.questions && eventFormData.questions.length > 0) {
      setCurrentStep('event')
    }
    // Pass guest info to parent
    onGuestFormSubmit(guestInfo)
  }

  const handleEventFormSubmit = (formResponses: Record<string, string>) => {
    // Pass form responses to parent
    onEventFormSubmit(formResponses)
  }

  const handleEventFormBack = () => {
    setCurrentStep('guest')
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="bg-bgColor-white w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[600px] sm:w-auto sm:mx-auto rounded-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'guest' ? (
              totalItemCount > 1
                ? `${t('guest-checkout-title')} ${t('checkout-people-count', { count: totalItemCount })}`
                : t('guest-checkout-title')
            ) : (
              t('event-registration-form-title')
            )}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'guest' ? (
              <>
                {totalItemCount > 1
                  ? userId ? t('checkout-description-with-login', {
                    otherGuestsText: totalItemCount - 1 === 1
                      ? t('guest-checkout-other-guests-single', { count: totalItemCount - 1 })
                      : t('guest-checkout-other-guests-plural', { count: totalItemCount - 1 })
                  }) : t('guest-checkout-description-with-login', {
                    otherGuestsText: totalItemCount - 1 === 1
                      ? t('guest-checkout-other-guests-single', { count: totalItemCount - 1 })
                      : t('guest-checkout-other-guests-plural', { count: totalItemCount - 1 })
                  }) : t('checkout-description-first-line')
                }
                {userId ? (
                  // Logged in user
                  <>
                    {' '}{t('checkout-description-first-form-filled')}{' '}
                    <Link href={`/profile`} className="text-blue-500 hover:text-blue-600 underline">
                      {t('checkout-profile-link')}
                    </Link>
                    . {t('checkout-fill-empty-fields')}
                  </>
                ) : (
                  // Guest user
                  <>
                    {' '}{t('more-over-encouraged')}{' '}
                    <Link href="/signIn" className="text-blue-500 hover:text-blue-600 underline">
                      {t('guest-checkout-login-link')}
                    </Link>{' '}
                    {t('guest-checkout-login-text')}
                  </>
                )}
              </>
            ) : (
              t('event-registration-form-description')
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 'guest' ? (
              <motion.div
                key="guest-form"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <GuestInfoForm
                  onSubmit={handleGuestFormSubmit}
                  mainUserEmail={userInfo?.email || ''}
                  mainUserPhone={userInfo?.phone || ''}
                  mainUserName={userInfo?.name || ''}
                  userId={userId}
                  buttonText={(eventFormData && eventFormData.questions && eventFormData.questions.length > 0 ? t('go-to-next-section'): t('reserve-button')) || undefined}
                  totalItemCount={totalItemCount || 1}
                />
              </motion.div>
            ) : (
              <motion.div
                key="event-form"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {eventFormData && (
                  <PaymentInfoForm
                    eventFormData={eventFormData}
                    onSubmit={handleEventFormSubmit}
                    onBack={handleEventFormBack}
                    isLoading={isLoading}
                    buttonText={t('continue-to-payment') || undefined}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}


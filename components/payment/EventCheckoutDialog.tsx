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
import PaymentInfoForm, { FormResponses } from './PaymentInfoForm'
import { EventFormData, FormQuestion, FormQuestionCondition } from '@/lib/actions/event/getEventForm'
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
  onEventFormSubmit: (formResponses: FormResponses) => void
  totalGuestRequired: number
  userId: string | null
  userInfo: {
    email?: string | null
    phone?: string | null
    name?: string | null
  } | null
  eventFormData?: EventFormData
  isLoading: boolean
  t: (key: string, params?: any) => string
}

// ---------------------------------------------------------------------------
// Condition evaluation helpers
// ---------------------------------------------------------------------------

function evaluateCondition(
  condition: FormQuestionCondition,
  answer: string | string[] | undefined
): boolean {
  const answerString =
    Array.isArray(answer) ? answer[0] : answer

  // Number condition
  if (condition.numberOperator !== undefined) {
    if (!answerString && answerString !== '0') return false
    const num = Number(answerString)
    const val = condition.numberValue ?? 0
    if (condition.numberOperator === 'eq') return num === val
    if (condition.numberOperator === 'lt') return num < val
    if (condition.numberOperator === 'gt') return num > val
  }

  // Choice condition
  if (condition.selectedChoices && condition.selectedChoices.length > 0) {
    const answerValues: string[] = Array.isArray(answer)
      ? answer
      : typeof answer === 'string'
        ? answer.split(',').map((v) => v.trim()).filter(Boolean)
        : []

    const matchesChoice = (selectedChoice: string, answerValue: string) => {
      if (answerValue === selectedChoice) return true
      // Custom option values are stored like:
      // "Other:$customInput$:'Hello, Im here'"
      return (
        answerValue.startsWith(selectedChoice + ':') ||
        answerValue.startsWith(selectedChoice)
      )
    }

    if (condition.matchMode === 'all') {
      return condition.selectedChoices.every((c) =>
        answerValues.some((v) => matchesChoice(c, v))
      )
    }
    // 'any' (default for single_choice too)
    return condition.selectedChoices.some((c) =>
      answerValues.some((v) => matchesChoice(c, v))
    )
  }

  return true
}

/**
 * Returns the subset of questions that should be visible given accumulated
 * answers from all previous forms.
 * - Form 0 questions have no conditions, so all are returned as-is.
 * - Form 1+ questions may have a linkedQuestionId + condition which is
 *   evaluated against the accumulated answers.
 */
function getVisibleQuestions(
  questions: FormQuestion[],
  formIndex: number,
  allAnswers: FormResponses
): FormQuestion[] {
  if (formIndex === 0) return questions
  return questions.filter((q) => {
    if (!q.linkedQuestionId || !q.condition) return true
    return evaluateCondition(
      q.condition,
      allAnswers[q.linkedQuestionId]?.answer
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventCheckoutDialog({
  open,
  onOpenChange,
  onGuestFormSubmit,
  onEventFormSubmit,
  totalGuestRequired,
  userId,
  userInfo,
  eventFormData,
  isLoading,
  t,
}: EventCheckoutDialogProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('guest')
  const [currentEventFormIndex, setCurrentEventFormIndex] = useState(0)
  // Accumulated answers across all event forms (keyed by question id)
  const [allFormAnswers, setAllFormAnswers] = useState<FormResponses>({})

  const eventForms = eventFormData ?? []

  // True when the data contains at least one form with at least one question
  const hasEventForms = eventForms.some((f) => f.questions.length > 0)

  /**
   * Find the index of the next form (after `fromIndex`) that has at least one
   * visible question given the provided accumulated answers.
   * Returns -1 when no such form exists.
   */
  const findNextFormIndex = (
    fromIndex: number,
    answers: FormResponses
  ): number => {
    for (let i = fromIndex + 1; i < eventForms.length; i++) {
      const visible = getVisibleQuestions(eventForms[i].questions, i, answers)
      if (visible.length > 0) return i
    }
    return -1
  }

  // Questions the user should see in the current event-form step
  const currentFormQuestions = eventForms[currentEventFormIndex]
    ? getVisibleQuestions(
        eventForms[currentEventFormIndex].questions,
        currentEventFormIndex,
        allFormAnswers
      )
    : []

  const isLastEventForm =
    findNextFormIndex(currentEventFormIndex, allFormAnswers) === -1

  // ---------------------------------------------------------------------------

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep('guest')
        setCurrentEventFormIndex(0)
        setAllFormAnswers({})
      }, 300)
    }
  }

  const handleGuestFormSubmit = (
    representativeGuest: { name: string; email: string; phone: string },
    otherGuests: Array<{ name: string; email: string; phone: string }>
  ) => {
    const guestInfo = {
      guestName: representativeGuest.name,
      guestEmail: representativeGuest.email,
      guestPhone: representativeGuest.phone,
      otherGuests,
    }

    if (hasEventForms) {
      // Find the first form that has questions (should always be index 0, but be safe)
      const firstIndex = eventForms.findIndex((f) => f.questions.length > 0)
      setCurrentEventFormIndex(firstIndex === -1 ? 0 : firstIndex)
      setCurrentStep('event')
    }

    onGuestFormSubmit(guestInfo)
  }

  const handleEventFormSubmit = (formResponses: FormResponses) => {
    const merged = { ...allFormAnswers, ...formResponses }
    setAllFormAnswers(merged)

    const nextIndex = findNextFormIndex(currentEventFormIndex, merged)

    if (nextIndex !== -1) {
      // More forms to show — advance
      setCurrentEventFormIndex(nextIndex)
    } else {
      // All forms done — hand off combined answers to parent
      onEventFormSubmit(merged)
    }
  }

  const handleEventFormBack = (currentResponses?: FormResponses) => {
    if (currentResponses) {
      // Save what the user has typed so far for the current step.
      setAllFormAnswers((prev) => ({ ...prev, ...currentResponses }))
    }

    if (currentEventFormIndex === 0) {
      setCurrentStep('guest')
    } else {
      // Walk back to find the previous visible form
      for (let i = currentEventFormIndex - 1; i >= 0; i--) {
        const visible = getVisibleQuestions(eventForms[i].questions, i, allFormAnswers)
        if (visible.length > 0) {
          setCurrentEventFormIndex(i)
          return
        }
      }
      setCurrentStep('guest')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="bg-bgColor-white w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[600px] sm:w-auto sm:mx-auto rounded-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'guest' ? (
              totalGuestRequired > 1
                ? `${t('guest-checkout-title')} ${t('checkout-people-count', { count: totalGuestRequired })}`
                : t('guest-checkout-title')
            ) : (
              t('event-registration-form-title')
            )}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'guest' ? (
              <>
                {totalGuestRequired > 1
                  ? userId ? t('checkout-description-with-login', {
                    otherGuestsText: totalGuestRequired - 1 === 1
                      ? t('guest-checkout-other-guests-single', { count: totalGuestRequired - 1 })
                      : t('guest-checkout-other-guests-plural', { count: totalGuestRequired - 1 })
                  }) : t('guest-checkout-description-with-login', {
                    otherGuestsText: totalGuestRequired - 1 === 1
                      ? t('guest-checkout-other-guests-single', { count: totalGuestRequired - 1 })
                      : t('guest-checkout-other-guests-plural', { count: totalGuestRequired - 1 })
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
                  buttonText={(hasEventForms ? t('go-to-next-section') : t('reserve-button')) || undefined}
                  totalItemCount={totalGuestRequired || 1}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`event-form-${currentEventFormIndex}`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <PaymentInfoForm
                  questions={currentFormQuestions}
                  onSubmit={handleEventFormSubmit}
                  onBack={(responses) => handleEventFormBack(responses)}
                  isLoading={isLoading}
                  initialResponses={allFormAnswers}
                  buttonText={
                    isLastEventForm
                      ? t('continue-to-payment') || undefined
                      : t('go-to-next-section') || undefined
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import PaymentInfoForm, { FormResponses } from './PaymentInfoForm'
import {
  EventFormData,
  FormQuestion,
  FormQuestionCondition,
} from '@/lib/actions/event/getEventForm'
import { submitPostPaymentForm } from '@/lib/actions/payment/postPaymentForm'

type FormQuestionConditionLocal = FormQuestionCondition

function evaluateCondition(
  condition: FormQuestionConditionLocal,
  answer: string | string[] | undefined
): boolean {
  const answerString = Array.isArray(answer) ? answer[0] : answer

  if (condition.numberOperator !== undefined) {
    if (!answerString && answerString !== '0') return false
    const num = Number(answerString)
    const val = condition.numberValue ?? 0
    if (condition.numberOperator === 'eq') return num === val
    if (condition.numberOperator === 'lt') return num < val
    if (condition.numberOperator === 'gt') return num > val
  }

  if (condition.selectedChoices && condition.selectedChoices.length > 0) {
    const answerValues: string[] = Array.isArray(answer)
      ? answer
      : typeof answer === 'string'
        ? answer.split(',').map((v) => v.trim()).filter(Boolean)
        : []

    const matchesChoice = (selectedChoice: string, answerValue: string) => {
      if (answerValue === selectedChoice) return true
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
    return condition.selectedChoices.some((c) =>
      answerValues.some((v) => matchesChoice(c, v))
    )
  }

  return true
}

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

interface PostPaymentEventFormProps {
  paymentId: string
  userId: string
  eventKeyName: string
  guestEmail: string
  eventTitle: string
  guestName: string | null
  eventFormData: EventFormData
  locale: string
  eventType: string
}

export default function PostPaymentEventForm({
  paymentId,
  userId,
  eventKeyName,
  guestEmail,
  eventTitle,
  guestName,
  eventFormData,
  locale,
  eventType,
}: PostPaymentEventFormProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')
  const router = useRouter()

  const eventForms = eventFormData ?? []
  const [currentEventFormIndex, setCurrentEventFormIndex] = useState(() => {
    const firstIndex = eventForms.findIndex((f) => f.questions.length > 0)
    return firstIndex === -1 ? 0 : firstIndex
  })
  const [allFormAnswers, setAllFormAnswers] = useState<FormResponses>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const currentFormQuestions = eventForms[currentEventFormIndex]
    ? getVisibleQuestions(
        eventForms[currentEventFormIndex].questions,
        currentEventFormIndex,
        allFormAnswers
      )
    : []

  const isLastEventForm =
    findNextFormIndex(currentEventFormIndex, allFormAnswers) === -1

  const handleFormStepSubmit = async (stepResponses: FormResponses) => {
    const merged = { ...allFormAnswers, ...stepResponses }
    setAllFormAnswers(merged)

    const nextIndex = findNextFormIndex(currentEventFormIndex, merged)

    if (nextIndex !== -1) {
      setCurrentEventFormIndex(nextIndex)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitPostPaymentForm({
        paymentId,
        userId,
        eventKeyName,
        guestEmail,
        formResponses: merged,
      })

      if (!result.success) {
        const errorKey = `post-payment-form-error-${result.error}`
        toast.error(t(errorKey, { defaultValue: t('post-payment-form-error-server_error') }))
        return
      }

      router.push(
        `/${locale}/events/${eventType}/${eventKeyName}/form/success`
      )
    } catch {
      toast.error(t('post-payment-form-error-server_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormBack = (currentResponses?: FormResponses) => {
    if (currentResponses) {
      setAllFormAnswers((prev) => ({ ...prev, ...currentResponses }))
    }

    if (currentEventFormIndex === 0) return

    for (let i = currentEventFormIndex - 1; i >= 0; i--) {
      const visible = getVisibleQuestions(eventForms[i].questions, i, allFormAnswers)
      if (visible.length > 0) {
        setCurrentEventFormIndex(i)
        return
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="width-max-default mx-auto px-4 pb-16 pt-[100px] md:pt-[120px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t('event-registration-form-title')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('post-payment-form-description', { eventTitle })}
        </p>
        {guestName && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('post-payment-form-guest-label')}: {guestName} ({guestEmail})
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="rounded-lg border bg-white p-6 shadow-sm"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`event-form-${currentEventFormIndex}`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <PaymentInfoForm
              questions={currentFormQuestions}
              onSubmit={handleFormStepSubmit}
              onBack={
                currentEventFormIndex > 0
                  ? (responses) => handleFormBack(responses)
                  : undefined
              }
              isLoading={isSubmitting}
              initialResponses={allFormAnswers}
              buttonText={
                isLastEventForm
                  ? t('post-payment-form-submit') || undefined
                  : t('go-to-next-section') || undefined
              }
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

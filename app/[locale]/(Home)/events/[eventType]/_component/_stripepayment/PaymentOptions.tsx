'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EventNormalCheckOut from './EventNormalCheckOut'
import EventQuickCheckout from './EventQuickCheckout'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
interface PaymentOptionsProps {
  stripePriceId: string
  stripeProductId: string
  stripeSubscribedPriceId: string
  formLink: string
  eventKeyName: string
  price: number
  eventId: string
  title: string
  userId: string
  fullCourseDiscount?: number
  email: string
  type: string
  loggedIn: boolean
}

type OptionType = 'checkout' | 'quick' | 'etransfer'

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  stripePriceId,
  stripeProductId,
  stripeSubscribedPriceId,
  formLink,
  eventKeyName,
  price,
  eventId,
  title,
  userId,
  fullCourseDiscount,
  email,
  type,
  loggedIn,
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')
  const router = useRouter()
  const [selected, setSelected] = useState<OptionType>('checkout')
  const [showOptions, setShowOptions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevShowOptionsRef = useRef(false)

  // Scroll to bottom when options are opened (transition from false to true)
  useEffect(() => {
    if (showOptions && !prevShowOptionsRef.current && containerRef.current) {
      // Find the closest scrollable parent
      let element: HTMLElement | null = containerRef.current
      let scrollableParent: HTMLElement | null = null

      while (element && !scrollableParent) {
        const { overflowY } = window.getComputedStyle(element)
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollableParent = element
          break
        }
        element = element.parentElement
      }

      // Scroll to bottom after animation
      const timeoutId = setTimeout(() => {
        if (scrollableParent) {
          scrollableParent.scrollTo({
            top: scrollableParent.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 500) // Wait for animation to complete (400ms animation + 100ms buffer)

      prevShowOptionsRef.current = showOptions
      return () => clearTimeout(timeoutId)
    }
    prevShowOptionsRef.current = showOptions
  }, [showOptions])

  const options: { id: OptionType; label: string }[] = [
    { id: 'checkout', label: 'normal-checkout' },
    // only show quick checkout if not using formLink
    ...(!formLink
      ? [
          {
            id: 'quick' as OptionType,
            label: type === 'CLASS' ? 'quick-checkout-class' : 'quick-checkout',
          },
        ]
      : []),
    { id: 'etransfer', label: 'E-transfer' },
  ]

  return (
    <div ref={containerRef} className="w-full text-bgColor-black">
      {loggedIn ? (
        <Button
          variant="default"
          onClick={() => {
            const willOpen = !showOptions
            setShowOptions(willOpen)
            // Scroll is handled in useEffect when showOptions transitions to true
          }}
          className="mb-4 font-semibold w-full"
        >
          {t('reserve-here')}
          <ChevronRight
            className={`ml-2 h-5 w-5 transition-transform duration-300 ${showOptions ? 'rotate-90' : 'rotate-0'}`}
          />
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={() => router.push('/signIn')}
          className="mb-4 font-semibold"
        >
          {t('login-to-reserve')}
        </Button>
      )}

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex flex-col items-start gap-4 rounded-md bg-gray-50 p-4 shadow-inner dark:bg-gray-900"
          >
            <div className="flex flex-wrap gap-4">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`rounded border px-4 py-2 font-medium transition-all ${
                    selected === option.id
                      ? 'bg-primary text-white shadow'
                      : 'border-gray-300 bg-white hover:bg-gray-100'
                  }`}
                >
                  {t(option.label)}
                </button>
              ))}
            </div>

            {selected === 'checkout' && (
              <div className="w-full">
                <EventNormalCheckOut
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
                  stripeSubscribedPriceId={stripeSubscribedPriceId}
                  formLink={formLink}
                  eventKeyName={eventKeyName}
                  userId={userId}
                  eventId={eventId}
                  price={price}
                  fullCourseDiscount={fullCourseDiscount}
                  email={email}
                  type={type}
                />
              </div>
            )}
            {selected === 'quick' && (
              <div className="w-full">
                <EventQuickCheckout
                  price={price}
                  eventId={eventId}
                  userId={userId}
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
                  type={type}
                />
              </div>
            )}
            {selected === 'etransfer' && (
              <div className="rounded border bg-white p-4 text-sm leading-relaxed dark:bg-gray-800">
                <p className="mb-2 font-semibold">
                  {t('etransfer-description')}
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    {t('etransfer-description-1')}{' '}
                    <strong>finance@vietvibe.org</strong>
                  </li>
                  <li>
                    {t('etransfer-description-2')}{' '}
                    <em>&quot;What is the event name?&quot;</em>,{' '}
                    {t('etransfer-description-6')}:{' '}
                    <em>&quot;{eventKeyName}&quot;</em>
                  </li>
                  <li>
                    {t('etransfer-description-3')}: <strong>{title}</strong>,{' '}
                    {t('etransfer-description-3_5')}
                  </li>
                  <li>
                    {t('etransfer-description-4')}{' '}
                    <Link
                      href="https://www.facebook.com/people/VIET-VIBE/61570910920072/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-textColor-blue hover:text-textColor-blue"
                    >
                      Facebook
                    </Link>
                    /
                    <Link
                      href="https://www.instagram.com/vietvibe.foundation/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-textColor-blue hover:text-textColor-blue"
                    >
                      Instagram
                    </Link>{' '}
                    {t('etransfer-description-5')}
                  </li>
                </ul>
                <p className="pt-2 text-xs italic">
                  *{t('etransfer-description-7')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentOptions

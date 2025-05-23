'use client'

import { useState } from 'react'
import ClassNormalCheckOut from './ClassNormalCheckOut'
import ClassQuickCheckout from './ClassQuickCheckout'
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
  classKeyName: string
  price: number
  classId: string
  title: string
  userId: string
  fullCourseDiscount?: number
  email: string
}

type OptionType = 'checkout' | 'quick' | 'etransfer'

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  stripePriceId,
  stripeProductId,
  stripeSubscribedPriceId,
  formLink,
  classKeyName,
  price,
  classId,
  title,
  userId,
  fullCourseDiscount,
  email,
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  const [selected, setSelected] = useState<OptionType>('checkout')
  const [showOptions, setShowOptions] = useState(false)

  const options: { id: OptionType; label: string }[] = [
    { id: 'checkout', label: 'normal-checkout' },
    { id: 'quick', label: 'quick-checkout' },
    { id: 'etransfer', label: 'E-transfer' },
  ]

  return (
    <div className="w-full">
      <Button
        variant="default"
        onClick={() => setShowOptions((prev) => !prev)}
        className="mb-4 font-semibold"
      >
        {t('reserve-here')}
        <ChevronRight
          className={`ml-2 h-5 w-5 transition-transform duration-300 ${showOptions ? 'rotate-90' : 'rotate-0'}`}
        />
      </Button>

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
              <div className="w-fit">
                <ClassNormalCheckOut
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
                  stripeSubscribedPriceId={stripeSubscribedPriceId}
                  formLink={formLink}
                  classKeyName={classKeyName}
                  userId={userId}
                  classId={classId}
                  price={price}
                  fullCourseDiscount={fullCourseDiscount}
                  email={email}
                />
              </div>
            )}
            {selected === 'quick' && (
              <div className="w-fit">
                <ClassQuickCheckout
                  price={price}
                  classId={classId}
                  userId={userId}
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
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
                    {t('etransfer-description-2')} <em>Class Name</em>,{' '}
                    {t('etransfer-description-6')}: <em>{classKeyName}</em>
                  </li>
                  <li>
                    {t('etransfer-description-3')}: <strong>{title}</strong>
                  </li>
                  <li>
                    {t('etransfer-description-4')}{' '}
                    <Link
                      href="https://www.facebook.com/people/VIET-VIBE/61570910920072/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Facebook
                    </Link>
                    /
                    <Link
                      href="https://www.instagram.com/vietvibe.foundation/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Instagram
                    </Link>{' '}
                    {t('etransfer-description-5')}
                  </li>
                </ul>
                <p className="italic pt-2 text-xs">*{t('etransfer-description-7')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentOptions

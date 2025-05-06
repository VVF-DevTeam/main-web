'use client'

import { useState } from 'react'
import ClassNormalCheckOut from './ClassNormalCheckOut'
import ClassQuickCheckout from './ClassQuickCheckout'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentOptionsProps {
  stripePriceId: string
  formLink: string
  classKeyName: string
  price: number
  classId: string
  title: string
  userId: string
}

type OptionType = 'checkout' | 'quick' | 'etransfer'

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  stripePriceId,
  formLink,
  classKeyName,
  price,
  classId,
  title,
  userId,
}) => {
  const [selected, setSelected] = useState<OptionType>('checkout')
  const [showOptions, setShowOptions] = useState(false)

  const options: { id: OptionType; label: string }[] = [
    { id: 'checkout', label: 'Normal Checkout' },
    { id: 'quick', label: 'Quick Checkout' },
    { id: 'etransfer', label: 'E-transfer' },
  ]

  return (
    <div className="w-full">
      <Button
        variant="default"
        onClick={() => setShowOptions((prev) => !prev)}
        className="mb-4 font-semibold"
      >
        Reserve Here
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
                  {option.label}
                </button>
              ))}
            </div>

            {selected === 'checkout' && (
              <div className="w-fit">
                <ClassNormalCheckOut
                  stripePriceId={stripePriceId}
                  formLink={formLink}
                  classKeyName={classKeyName}
                  userId={userId}
                  classId={classId}
                />
              </div>
            )}
            {selected === 'quick' && (
              <div className="w-fit">
                <ClassQuickCheckout
                  price={price}
                  classId={classId}
                  userId={userId}
                />
              </div>
            )}
            {selected === 'etransfer' && (
              <div className="rounded border bg-white p-4 text-sm leading-relaxed dark:bg-gray-800">
                <p className="mb-2 font-semibold">
                  To complete your payment via e-transfer:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    Send your payment to: <strong>payment@vietvibe.org</strong>
                  </li>
                  <li>
                    Use the security question: <em>Class Name</em>, answer:
                    <em>{classKeyName}</em>
                  </li>
                  <li>
                    Include your full name and class title
                    <strong>{title}</strong> in the message
                  </li>
                  <li>
                    Send us a message on our Facebook/Instagram page for
                    confirmation.
                  </li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentOptions
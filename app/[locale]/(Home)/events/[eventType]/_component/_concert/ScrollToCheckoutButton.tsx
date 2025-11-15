'use client'

import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'

interface ScrollToCheckoutButtonProps {
  text: string
}

export default function ScrollToCheckoutButton({
  text,
}: ScrollToCheckoutButtonProps) {
  const handleClick = () => {
    const checkoutSection = document.getElementById('checkout-section')
    if (checkoutSection) {
      // Find the closest scrollable parent
      let element: HTMLElement | null = checkoutSection
      let scrollableParent: HTMLElement | null = null

      while (element && !scrollableParent) {
        const { overflowY } = window.getComputedStyle(element)
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollableParent = element
          break
        }
        element = element.parentElement
      }

      if (scrollableParent) {
        // Scroll within the scrollable container
        const elementRect = checkoutSection.getBoundingClientRect()
        const parentRect = scrollableParent.getBoundingClientRect()
        const scrollTop = scrollableParent.scrollTop
        const relativeTop = elementRect.top - parentRect.top + scrollTop

        scrollableParent.scrollTo({
          top: relativeTop - 20, // 20px offset from top
          behavior: 'smooth',
        })
      } else {
        // No scrollable parent found, use window scroll
        const elementPosition = checkoutSection.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 150 // 150px for navbar

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }
  }

  return (
    <div className="hidden w-full md:block">
      <Button onClick={handleClick} variant="default" className="w-full">
        <ArrowDown className="h-4 w-4" /> {text}
      </Button>
    </div>
  )
}

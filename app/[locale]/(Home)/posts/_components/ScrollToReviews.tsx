'use client'

import { useEffect } from 'react'

const ScrollToReviews = () => {
  useEffect(() => {
    // Wait for the page to fully load and then scroll to reviews
    const scrollToReviews = () => {
      const reviewsSection = document.getElementById('reviews-section')
      if (reviewsSection) {
        reviewsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }

    // Use a timeout to ensure all components are rendered
    const timeoutId = setTimeout(() => {
      scrollToReviews()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  // This component doesn't render anything visible
  return null
}

export default ScrollToReviews

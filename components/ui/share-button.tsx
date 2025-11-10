"use client"
import { Copy, Share } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
}

const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  ({ href, onClick, ...props }, ref) => {
    const [currentHref, setCurrentHref] = useState(href || '')

    // Get href from window after component mounts (client-side only)
    useEffect(() => {
      if (!currentHref && typeof window !== 'undefined') {
        setCurrentHref(window.location.href)
      }
    }, [currentHref])

    // Copy share link to clipboard
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const urlToShare = currentHref || (typeof window !== 'undefined' ? window.location.href : '')

      if (!urlToShare) {
        toast.error('Unable to get page URL')
        return
      }

      try {
        await navigator.clipboard.writeText(urlToShare)
        toast('Copied current page link to clipboard', {
          icon: <Copy className="h-4 w-4" />,
          className: 'text-green-500',
        })
      } catch (error) {
        console.error('Failed to copy current page link to clipboard:', error)
      }

      // Call the original onClick handler if provided
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        className="group p-1"
        onClick={handleClick}
        {...props}
      >
        <Share className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
      </button>
    )
  }
)

ShareButton.displayName = 'ShareButton'

export default ShareButton

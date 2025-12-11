'use client'
// Libraries
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Interfaces & Types
import { ReviewWithUserAndEvent } from '@/lib/actions/review/reviewActions'
import Image from 'next/image'
import Link from 'next/link'

interface ReviewByMemberProps {
  locale: string
  reviews: ReviewWithUserAndEvent[]
}

const AVATAR_PLACEHOLDER =
  'https://drive.google.com/thumbnail?id=1Vjy12B-hkodyEouCprguvMvICCg2o5Ab'

const ReviewCard: React.FC<{
  name?: string | null
  date?: string | Date | null
  comment?: string | null
  avatarUrl?: string | null
  locale?: string
  eventTitle?: string | null
  eventDate?: string | Date | null
}> = ({
  name = 'Anonymous',
  date,
  comment,
  avatarUrl,
  locale = 'en',
  eventTitle,
}) => {
  const displayDate = date
    ? new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const commentTooLong = comment && comment.length > 230

  return (
    <div className="h-[230px] w-[350px] overflow-hidden rounded-2xl bg-bgColor-secondary400 px-10 py-4 text-textColor-black shadow-sm md:w-auto md:max-w-[360px]">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 overflow-hidden rounded-full">
          <Image
            src={avatarUrl || AVATAR_PLACEHOLDER}
            alt={`${name}'s avatar`}
            width={36}
            height={36}
            className="h-9 w-9 object-cover rounded-full"
            loading="lazy"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold">{name}</div>
          {(displayDate || eventTitle) && (
            <div className="text-xs text-slate-500">
              {displayDate}
              {displayDate && eventTitle && ' - '}
              {eventTitle}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-base">
        {commentTooLong ? comment.slice(0, 200) + '...' : comment}
        {commentTooLong && (
          <Link
            href={`/posts?redirectToReviewsSection=true`}
            rel="noopener noreferrer"
            target="_blank"
          >
            (
            <span className="underline hover:text-bgColor-brand900">
              Read more
            </span>
            )
          </Link>
        )}
      </p>
    </div>
  )
}

const ReviewByMember = ({ locale, reviews }: ReviewByMemberProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')
  const [pageNumber, setPageNumber] = useState(1)
  const reviewsPerPage = 3
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const startIndex = (pageNumber - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = reviews.slice(startIndex, endIndex)

  return (
    <div className="flex flex-col gap-y-5">
      <h2 className="web_h1 text-center">
        {t('trusted-by-our-members')}
      </h2>
      <h3 className="web-body-regular text-center">{t('review-motto')}</h3>
      <div className="flex flex-col items-center justify-center gap-10 gap-y-3 pt-5 md:mx-auto md:grid md:grid-cols-2 lg:grid-cols-3">
        {currentReviews.map((review) => (
          <ReviewCard
            key={review.id}
            name={review.user?.name}
            // try event date, createdAt, or updatedAt for display
            date={review.createdAt || review.updatedAt || null}
            comment={review.comment}
            // if you store user avatar, use it; otherwise placeholder stays
            avatarUrl={review.user?.image || null}
            locale={locale}
            eventTitle={review.event?.title}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-10 pt-5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPageNumber(i + 1)}
            disabled={pageNumber === i + 1}
          >
            <div
              className={`h-[18px] w-[18px] rounded-full ${pageNumber === i + 1 ? 'bg-bgColor-brand900' : 'bg-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ReviewByMember

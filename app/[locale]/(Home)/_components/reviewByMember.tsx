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
  'https://drive.google.com/thumbnail?id=1Vjy12B-hkodyEouCprguvMvICCg2o5Ab&sz=w2000'

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
    <div className="w-[350px] md:w-auto md:max-w-[360px] h-[230px] rounded-2xl bg-[#FAECEF] px-10 py-4 text-[#486284] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/70">
          <Image
            src={avatarUrl || AVATAR_PLACEHOLDER}
            alt={`${name}'s avatar`}
            fill
            sizes="36px"
            className="object-cover"
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
        {commentTooLong ? comment.slice(0, 210) + '...' : comment}
        {commentTooLong && (
          <Link href={`/posts?redirectToReviewsSection=true`} rel="noopener noreferrer" target="_blank">
            (
            <span className="underline hover:text-bgColor-brand">
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
      <h2 className="header-main text-center font-bold">
        {t('trusted-by-our-members')}
      </h2>
      <h3 className="body-large text-center">
        {t('plan-ahead')}
      </h3>
      <div className="flex flex-col gap-y-3 md:mx-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-10 pt-5 justify-center items-center">
        {currentReviews.map((review) => (
          <ReviewCard
            key={review.id}
            name={review.user?.name}
            // try event date, createdAt, or updatedAt for display
            date={
              review.createdAt || review.updatedAt || null
            }
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
              className={`h-[18px] w-[18px] rounded-full ${pageNumber === i + 1 ? 'bg-bgColor-brand' : 'bg-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ReviewByMember

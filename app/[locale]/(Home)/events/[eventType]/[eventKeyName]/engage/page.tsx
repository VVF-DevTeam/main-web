import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import { getEventByKeyName } from '@/lib/actions/event/getEventById'
import { getPublicEventPrizes } from '@/lib/actions/prize/eventPrizes'
import { getPublicGroupChallenge } from '@/lib/actions/challenge/groupChallenge'
import { getPublicEventVote } from '@/lib/actions/vote/eventVote'
import { SponsorPrizesSection } from '@/app/[locale]/(Home)/events/_components/SponsorPrizes'
import { GroupChallengeBoard } from '@/app/[locale]/(Home)/events/_components/GroupChallengeBoard'
import EventVotingPanel from '../../_component/EventVotingPanel'

interface EventEngagePageProps {
  params: Promise<{
    locale: string
    eventType: string
    eventKeyName: string
  }>
}

export async function generateMetadata({
  params,
}: EventEngagePageProps): Promise<Metadata> {
  const { locale, eventKeyName } = await params
  const event = await getEventByKeyName(eventKeyName)
  const { t } = await initTranslation(locale, ['event'])

  if (!event) {
    return { title: t('engage-page-title') }
  }

  return {
    title: `${event.title} | ${t('engage-page-title')}`,
    description: t('engage-page-title'),
  }
}

const EventEngagePage = async ({ params }: EventEngagePageProps) => {
  const { locale, eventType, eventKeyName } = await params
  const { t } = await initTranslation(locale, ['event'])

  const event = await getEventByKeyName(eventKeyName)
  if (!event) {
    notFound()
  }

  const session = await auth()
  const [prizes, challenge, vote] = await Promise.all([
    getPublicEventPrizes(event.id),
    getPublicGroupChallenge(event.id),
    getPublicEventVote(event.id),
  ])

  const hasContent =
    prizes.length > 0 || challenge !== null || vote !== null

  const backHref = `/${locale}/events/${eventType}/${eventKeyName}`

  return (
    <div className="w-full bg-bgColor-secondary200">
      <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-[100px] md:px-10 md:pt-[120px] lg:px-12">
        <Link
          href={backHref}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-bgColor-brand900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t('engage-back-to-event')}
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-neutral-900 md:text-3xl lg:text-4xl">
          {t('engage-page-title')}
        </h1>

        {!hasContent ? (
          <p className="rounded-2xl bg-white p-8 text-center text-muted-foreground shadow-sm">
            {t('engage-empty')}
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {!challenge && prizes.length > 0 && (
              <SponsorPrizesSection eventId={event.id} locale={locale} />
            )}
            <GroupChallengeBoard eventId={event.id} locale={locale} />
            <EventVotingPanel
              eventId={event.id}
              locale={locale}
              isLoggedIn={Boolean(session?.user)}
              userEmail={session?.user?.email}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventEngagePage

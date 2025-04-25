import ImageCarousel from '@/app/[locale]/(Home)/_components/imageCarousel'
import Introduction from '@/app/[locale]/(Home)/_components/_introduction/Introduction'
import Directors from './_components/directors'
import Contact from './_components/contact'
import JoinUs from './_components/joinUs'
import SocialMediaPosts from './_components/_socialmediaposts/SocialMediaPosts'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-y-12 overflow-hidden">
      <Introduction locale={locale} />
      {/* Intro cards */}
      <ImageCarousel autoSlide={true} locale={locale} />
      <SocialMediaPosts locale={locale} />
      <JoinUs locale={locale} />
      <Directors locale={locale} />
      <Contact locale={locale} />
    </div>
  )
}

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
  const imageUrls = [
    { id: '1', url: 'https://drive.google.com/thumbnail?id=1AqJvPcGUzuZM5pTnLWI_TPR0iZhIu27M&sz=w2000' },
    { id: '2', url: 'https://drive.google.com/thumbnail?id=1LzN0Kouxwfy1R07qkX0NfxWByIHMtyGJ&sz=w3000' },
    { id: '3', url: 'https://drive.google.com/thumbnail?id=1QWFZ4Uhijftf5YT-7_KFU9jVJhPHT7PN&sz=w2000' },
    { id: '4', url: 'https://drive.google.com/thumbnail?id=1mMK7znhBvIrMP0w9SrK6gp32bHtZgoc-&sz=w2000' },
  ]

  return (
    <div className="flex flex-col gap-y-12 overflow-hidden">
      <Introduction locale={locale} />
      {/* Intro cards */}
      <ImageCarousel imageUrls={imageUrls} autoSlide={true} />
      <JoinUs locale={locale} />
      <Directors locale={locale} />
      <SocialMediaPosts locale={locale} />
      <Contact locale={locale} />
    </div>
  )
}

import ImageCarousel from '@/app/[locale]/(Home)/_components/imageCarousel'
import Introduction from '@/app/[locale]/(Home)/_components/_introduction/Introduction'
import Directors from './_components/directors'
import Contact from './_components/contact'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const imageUrls = [
    { id: '1', url: 'https://drive.google.com/thumbnail?id=1IcCi98pC_IQ9IrE-J6tay3dAzKSXZshb&sz=w2000' },
    { id: '2', url: 'https://drive.google.com/thumbnail?id=1mMK7znhBvIrMP0w9SrK6gp32bHtZgoc-&sz=w2000' },
    { id: '3', url: 'https://drive.google.com/thumbnail?id=1HsFliVn1V3lBc3yMhFlOPG629zOj83Lg&sz=w2000' },
    { id: '4', url: 'https://drive.google.com/thumbnail?id=1M9hHWRlNCc6fFvlRfphq-uWwh2J12KFf&sz=w2000' },
  ]

  return (
    <div className="overflow-hidden">
      <Introduction locale={locale} />
      <ImageCarousel imageUrls={imageUrls} autoSlide={true} />
      <Directors />
      <Contact />
    </div>
  )
}

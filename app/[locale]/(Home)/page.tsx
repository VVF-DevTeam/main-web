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
    { id: '1', url: '/sample-images/image1.jpg' },
    { id: '2', url: '/sample-images/image2.jpg' },
    { id: '3', url: '/sample-images/image3.jpg' },
    { id: '4', url: '/sample-images/image4.jpg' },
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

import ImageCarousel from '@/app/[locale]/(Home)/_components/imageCarousel'
import About from '@/app/[locale]/(Home)/_components/about'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const imageUrls = [
    { id: '1', url: '/sample-images/image1.jpg' },
    { id: '2', url: '/sample-images/image2.jpg' },
    { id: '3', url: '/sample-images/image3.jpg' },
    { id: '4', url: '/sample-images/image4.jpg' },
  ]
  return (
    <div className="overflow-hidden">
      <ImageCarousel imageUrls={imageUrls} autoSlide={true} />
      <About locale={locale}/>
    </div>
  )
}

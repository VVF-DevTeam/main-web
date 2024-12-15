import ImageCarousel from './_components/imageCarousel'
import Contact from './_components/contact'
import About from './_components/about'
export default function Home() {
  const imageUrls = [
    { id: '1', url: '/sample-images/image1.jpg' },
    { id: '2', url: '/sample-images/image2.jpg' },
    { id: '3', url: '/sample-images/image3.jpg' },
    { id: '4', url: '/sample-images/image4.jpg' },
  ]
  return (
    <div className="overflow-hidden">
      <ImageCarousel imageUrls={imageUrls} autoSlide={true} />
      <About />
      <Contact />
    </div>
  )
}

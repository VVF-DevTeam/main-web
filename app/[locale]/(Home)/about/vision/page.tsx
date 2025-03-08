// Components
import About from '@/app/[locale]/(Home)/about/_components/_vision/about'

// Main Component
const AboutPageVision = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div>
      <About locale={locale} />
    </div>
  )
}

export default AboutPageVision

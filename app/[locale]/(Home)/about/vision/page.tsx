import About from '@/app/[locale]/(Home)/_components/about'

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

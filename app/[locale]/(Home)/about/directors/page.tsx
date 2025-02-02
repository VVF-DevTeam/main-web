import OrgMembers from './_components/OrgMembers'

const AboutPageDirectors = async({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  return (
    <div className="h-full w-full">
      <OrgMembers locale={locale}/>
    </div>
  )
}

export default AboutPageDirectors

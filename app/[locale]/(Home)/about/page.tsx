import OrgSummary from './_components/OrgSummary'
import OrgMembers from './_components/OrgMembers'
import Map from './_components/Map'

const AboutPage = () => {
  return (
    <div className="h-full w-full">
      <OrgSummary />
      <OrgMembers />
      <Map address='3549 Monmouth Avenue, V5R5S1'/>
    </div>
  )
}

export default AboutPage

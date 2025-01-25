import OrgSummary from './_components/OrgSummary'
import OrgMembers from './_components/OrgMembers'
import Map from './_components/Map'

const AboutPage = () => {
  return (
    <div className="h-full w-full">
      <OrgSummary />
      <OrgMembers />
      <Map address='6975 Vivian St, Vancouver, BC, Canada'/>
    </div>
  )
}

export default AboutPage

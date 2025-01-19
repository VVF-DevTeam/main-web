import MemberDescription from './MemberDescription'
import MemberImage from './MemberImage'

interface OrgMemberCardProps {
  id: number
  descriptions: string[]
  imageUrl: string
  title: string
}

const OrgMemberCard = ({
  id,
  descriptions,
  imageUrl,
  title,
}: OrgMemberCardProps) => {
  return (
    <div>
      {id % 2 === 0 ? (
        <div className="grid grid-cols-2 gap-x-12 p-12 md:grid-cols-[50%_50%]">
          <MemberDescription title={title} descriptions={descriptions} />
          <MemberImage imageUrl={imageUrl} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 p-12 md:grid-cols-[50%_50%]">
          <MemberImage imageUrl={imageUrl} />
          <MemberDescription title={title} descriptions={descriptions} />
        </div>
      )}
    </div>
  )
}

export default OrgMemberCard

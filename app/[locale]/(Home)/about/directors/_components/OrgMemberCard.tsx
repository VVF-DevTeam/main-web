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
    <div className="h-full w-full">
      {id % 2 === 0 ? (
        <div className="flex flex-col-reverse gap-x-6 gap-y-6 lg:grid lg:grid-cols-[50%_50%] lg:justify-items-center">
          <MemberDescription title={title} descriptions={descriptions} />
          <MemberImage imageUrl={imageUrl} />
        </div>
      ) : (
        <div className="flex flex-col gap-x-6 gap-y-6 lg:grid lg:grid-cols-[50%_50%] lg:justify-items-center">
          <MemberImage imageUrl={imageUrl} />
          <MemberDescription title={title} descriptions={descriptions} />
        </div>
      )}
    </div>
  )
}

export default OrgMemberCard

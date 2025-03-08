// Components
import MemberDescription from './MemberDescription'
import MemberImage from './MemberImage'

// Interfaces
interface OrgMemberCardProps {
  id: number
  description: string
  imageUrl: string
  title: string
  name: string
  bio: string
  locale: string
}

// Main Component
const OrgMemberCard = async ({
  id,
  description,
  imageUrl,
  title,
  name, 
  bio,
  locale,
}: OrgMemberCardProps) => {

  return (
    <div className="h-full w-full">
      {id % 2 === 0 ? (
        <div className="flex-center default-gap flex-col-reverse grid-lg-cols-2 lg:justify-items-center">
          <MemberDescription
            title={title}
            description={description}
            locale={locale}
            name={name}
            bio={bio}
          />
          <MemberImage imageUrl={imageUrl} />
        </div>
      ) : (
        <div className="flex-col-center default-gap grid-lg-cols-2 lg:justify-items-center">
          <MemberImage imageUrl={imageUrl} />
          <MemberDescription
            title={title}
            description={description}
            locale={locale}
            name={name}
            bio={bio}
          />
        </div>
      )}
    </div>
  )
}

export default OrgMemberCard

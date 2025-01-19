interface MemberDescriptionProps {
  title: string
  descriptions: string[]
}

const MemberDescription = ({ title, descriptions }: MemberDescriptionProps) => {
  return (
    <div className="my-auto flex basis-1/2 flex-col gap-y-8 text-[20px] font-light">
      <h1 className="text-2xl font-bold tracking-widest">{title}</h1>
      {descriptions.map((description, index) => ( 
        <p className="tracking-wide text-gray-700" key={index} >{description}</p>
      ))}
    </div>
  )
}

export default MemberDescription

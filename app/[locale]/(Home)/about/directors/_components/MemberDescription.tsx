interface MemberDescriptionProps {
  title: string
  descriptions: string[]
}

const MemberDescription = ({ title, descriptions }: MemberDescriptionProps) => {
  return (
    <div className="my-auto flex basis-1/2 flex-col gap-y-8 text-[20px] font-light">
      <h1 className="text-center text-2xl font-bold tracking-widest text-[#7f0000]">
        {title}
      </h1>
      <div className="flex flex-col gap-y-6">
        {descriptions.map((description, index) => (
          <p
            className="text-center tracking-wide text-gray-700 lg:text-pretty"
            key={index}
          >
            {description}
          </p>
        ))}
      </div>
    </div>
  )
}

export default MemberDescription

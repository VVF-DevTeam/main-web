'use client'
import { useRouter } from "next/navigation"

interface IntroDescriptionProps {
  title: string
  descriptions: string[]
}

const IntroDescription = ({ title, descriptions }: IntroDescriptionProps) => {
  const router = useRouter()

  return (
    <div className="my-auto flex basis-1/2 flex-col gap-y-8 pr-6 text-[20px] font-light md:max-w-96 text-center md:text-left">
      <h1 className="text-3xl font-bold tracking-wide text-[#3d3a3a]">
        {title}
      </h1>
      <div className="flex flex-col gap-y-6">
        {descriptions.map((description, index) => (
          <p className="text-sm text-gray-700" key={index}>
            {description}
          </p>
        ))}
      </div>
      <button 
        className="place-self-start bg-[#C54B3E] p-3 text-sm font-semibold text-white"
        onClick={() => router.push('/events')}
      >
        Explore Activities
      </button>
    </div>
  )
}

export default IntroDescription

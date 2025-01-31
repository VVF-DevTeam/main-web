"use client"
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

const Directors = () => {
  const router = useRouter()

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-10 pt-8 pb-10 md:p-12 lg:gap-y-12 lg:pt-14 lg:pb-28 ">
      <Separator className="w-1/2 bg-[#7f0000]" />
      <span className="font-[Poppins] text-4xl tracking-wide text-[#3d3a3a] md:text-5xl font-semibold italic pb-8">Our Directors</span>
      <div className="grid grid-cols-[50%_50%] pb-5">
        <div className="grid md:flex w-full gap-x-6 pl-10 justify-end border-r-[1px] border-[#3d3a3a] pr-2">
          <Image
            src="/bio/trong-nguyen.jpg"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="rounded-full object-cover w-[120px] h-[120px]"
          />
          <div className="flex flex-col gap-y-2">
            <span className="font-[Poppins] text-xl font-semibold text-[#3d3a3a]">
              Dr. Trong Nguyen
            </span>
            <span className="font-[Poppins] text-sm font-semibold text-[#C54B3E]">
              CEO
            </span>
            <span className="font-[Poppins] text-sm text-[#1B171A] max-w-[300px]">
            {`I am a doctor, and alongside helping people heal physically, I'm passionate about starting a community project to support the mental well-being of the Vietnamese community.`}
            </span>
          </div>
        </div>
        <div className="grid md:flex w-full gap-x-6 pl-10 justify-start">
          <Image
            src="/bio/eattle-nguyen-1.jpg"
            alt="Trong Nguyen"
            width={200}
            height={50}
            className="rounded-full object-cover w-[120px] h-[120px]"
          />
          <div className="flex flex-col gap-y-2">
            <span className="font-[Poppins] text-xl font-semibold text-[#3d3a3a]">
              Eattle Nguyen
            </span>
            <span className="font-[Poppins] text-sm font-semibold text-[#C54B3E]">
              CMO
            </span>
            <span className="font-[Poppins] text-sm text-[#1B171A] max-w-[300px]">
            {`I am a drummer. Leading bands and performing at events brings me joy, and I'm dedicated to bringing the Vietnamese community together through music and creativity.`}
            </span>
          </div>
        </div>
      </div>
      <button 
        className="bg-[#C54B3E] p-3 text-sm font-semibold text-white w-36"
        onClick={() => router.push('/about/directors')}
      >
        Meet More
      </button>
    </div>
  )
}

export default Directors

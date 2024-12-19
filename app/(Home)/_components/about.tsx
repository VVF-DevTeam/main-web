import React from 'react'
import GridCard from './gridCard'
import { Separator } from '@/components/ui/separator'

import { Building, CalendarDays, Users } from 'lucide-react'
const cardsData = [
  {
    id: 1,
    name: 'card1',
    logo: Building,
    desc: 'Sed molestie pulvinar. Vivamus mollis tempor blandit pharetra porttitor Nisl risus porttitor lacus lobortis eget diam senectus nascetur massa nam non libero pede mus suspendisse porttitor arcu dui. Dapibus eleifend.',
  },
  {
    id: 2,
    name: 'card2',
    logo: CalendarDays,
    desc: 'Sed molestie pulvinar. Vivamus mollis tempor blandit pharetra porttitor Nisl risus porttitor lacus lobortis eget diam senectus nascetur massa nam non libero pede mus suspendisse porttitor arcu dui. Dapibus eleifend.',
  },
  {
    id: 3,
    name: 'card3',
    logo: Users,
    desc: 'Sed molestie pulvinar. Vivamus mollis tempor blandit pharetra porttitor Nisl risus porttitor lacus lobortis eget diam senectus nascetur massa nam non libero pede mus suspendisse porttitor arcu dui. Dapibus eleifend.',
  },
]
const About = () => {
  return (
    <div className="bg-[#EFB9A2]/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-y-12 p-12">
        <div className="flex flex-col items-center justify-center gap-y-6 p-6">
          <h2 className="cursor-default text-5xl font-bold tracking-wider text-[#B83AB3] transition-all duration-100 ease-out hover:text-[#B83AB3]/80">
            ABOUT US
          </h2>
          <Separator className="w-1/2 bg-[#B83AB3]" />
          <p className="text-xl text-[#1B171A]/70">
            Sed molestie pulvinar. Vivamus mollis tempor blandit pharetra
            porttitor Nisl risus porttitor lacus lobortis eget diam senectus
            nascetur massa nam non libero pede mus suspendisse porttitor arcu
            dui. Dapibus eleifend. Sed molestie pulvinar. Vivamus mollis tempor
            blandit pharetra porttitor Nisl risus porttitor lacus lobortis eget
            diam senectus nascetur massa nam non libero pede mus suspendisse
            porttitor arcu dui. Dapibus eleifend.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cardsData.map((card) => (
            <GridCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default About

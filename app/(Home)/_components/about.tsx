import React from 'react'
import GridCard from './gridCard'
import { Separator } from '@/components/ui/separator'

import { Users, Volleyball, Guitar } from 'lucide-react'
const cardsData = [
  {
    id: 1,
    name: 'Sports classes and Tournaments',
    logo: Volleyball,
    desc:
      'From exciting friendly competitions to hands-on skill-building sessions, we invite everyone - regardless of age or experience - to join in. ' +
      'Come have fun, improve your skills, connect with others, and enjoy being part of a welcoming, vibrant, and inclusive community of learners.',
  },
  {
    id: 2,
    name: 'Music Lessons and Workshops',
    logo: Guitar,
    desc:
      'With professional performers engaging in a wide range of instruments and skills (guitar, piano, drum, dance, etc.), ' +
      'our music lessons and workshops offer participants the opportunity to learn, grow, and connect with the art of music in a hands-on and inspiring environment.',
  },

  {
    id: 3,
    name: 'Volunteer Activities and Events',
    logo: Users,
    desc:
      'We believe everyone deserves the chance to participate in activities and events that help them grow and build strong connections. ' +
      'We warmly welcome new members to join us and make meaningful contributions to the vibrant Vietnamese community.',
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
            We are the Viet Vibe Foundation, a vibrant non-profit organization
            dedicated to fostering community, culture, and creativity among
            Vietnamese community in Vancouver. With the enthusiasm and passion
            of our members, we aim to bring people together through the
            universal languages of sports and music and other activities.
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

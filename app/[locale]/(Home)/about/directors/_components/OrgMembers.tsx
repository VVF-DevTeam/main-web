import React from 'react'
import OrgMemberCard from './OrgMemberCard'

const memberData = [
  {
    id: 1,
    descriptions: [
      'A doctor, a guitarist, a data analyst, a programmer and a life-time learner.',
      'I love the job of helping others to relieve their pains and improve their quality of life. However, I realize that I cannot help thousands or millions of people if I keep working as current. That’s why I have been learning and working in computer science and data science to help more and more people in the world.',
    ],
    imageUrl: '/sample-images/trong-nguyen.jpg',
    title: 'Trong Nguyen',
  },
  {
    id: 2,
    descriptions: [
      'Bass player, singer, songwriter, and guitarist.',
      'Love Spanish songs, especially the ones that are about love and romance. I also love to sing and play guitar.',
    ],
    imageUrl: '/sample-images/tue-nguyen.jpg',
    title: 'Tue Nguyen',
  },
  {
    id: 3,
    descriptions: [
      'Drummer, singer, songwriter, and guitarist.',
      'Young and energetic, I love to sing and play guitar. Leading a band and performing in concerts are my passions, currently I am in charge of multiple bands at my school.',
    ],
    imageUrl: '/sample-images/eattle-nguyen.jpg',
    title: 'Eattle Nguyen',
  },
]

const OrgMembers = () => {
  return (
    <div className="px-6 py-32 bg-white">
      <h1 className="mb-20 text-center text-3xl font-semibold tracking-wide text-[#620BC4] md:text-4xl lg:text-5xl">
        Meet Our Founders
      </h1>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {memberData.map((member) => (
          <OrgMemberCard key={member.id} {...member} />
        ))}
      </div>
    </div>
  )
}

export default OrgMembers

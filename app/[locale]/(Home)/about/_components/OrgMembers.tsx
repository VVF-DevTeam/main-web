import Image from 'next/image'
import React from 'react'
import OrgMemberCard from './OrgMemberCard'

const memberData = [
  {
    id: 1,
    descriptions: [
      "You'll notice as soon as you step into our clinic, it just feels and looks different than you’re typically used to. It’s open, spacious, beautifully crafted, and built for functionality.",
      'Our facility was designed from the ground up to be equipped with tools necessary for rehabilitation, education, and therapy. We want our clinic to be a place of discovery for you and your therapist, in order to get you on the right track to recovery, no matter where your starting point is.',
    ],
    imageUrl: '/sample-images/image1.jpg',
    title: 'First director',
  },
  {
    id: 2,
    descriptions: [
      'Our clinic lighting was specifically designed to be dimmable and colour adjusting. You’ll notice the lights shine horizontally as to avoid shining too brightly downward. When our patients are exercising in the gym, the horizontal lights limit eye strain and irritation when looking up at the ceiling.',
    ],
    imageUrl: '/sample-images/image2.jpg',
    title: 'Second director',
  },
  {
    id: 3,
    descriptions: [
      'In our treatment rooms, the lighting can be tailored to your preference in order to suit your needs.',
      'Maybe you prefer a more relaxing, soothing environment for your hands-on portion of treatment if you are having an RMT session. Others may prefer a brighter environment, especially in the middle of the day.',
      'Just ask your therapist! We want to make you feel comfortable.',
    ],
    imageUrl: '/sample-images/image3.jpg',
    title: 'Third director',
  },
]

const OrgMembers = () => {
  return (
    <div className="bg-slate-300 px-6 py-32">
      <h1 className="mb-20 text-center text-3xl font-semibold tracking-wide md:text-4xl lg:text-5xl">
        Meet Our Founders
      </h1>
      <div className="flex flex-col gap-y-6">
        {memberData.map((member) => (
          <OrgMemberCard key={member.id} {...member} />
        ))}
      </div>
    </div>
  )
}

export default OrgMembers

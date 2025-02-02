import React from 'react'
import OrgMemberCard from './OrgMemberCard'
import { Separator } from '@/components/ui/separator'
import initTranslation from '@/app/i18n'

const memberData = [
  {
    id: 1,
    descriptions: [
      'description-TrongNguyen',
      'bio-TrongNguyen',
    ],
    imageUrl: '/bio/trong-nguyen.jpg',
    title: 'Trong Nguyen (Founder/CEO)',
  },
  {
    id: 2,
    descriptions: [
      'description-EricNguyen',
      'bio-EricNguyen',
    ],
    imageUrl: '/bio/tue-nguyen.jpg',
    title: 'Tue Nguyen (Co-Founder/COO)',
  },
  {
    id: 3,
    descriptions: [
      'description-KhueLe',
      'bio-KhueLe',
    ],
    imageUrl: '/bio/khue-le.jpg',
    title: 'Khue Le (Co-Founder/CHRO)',
  },  
  {
    id: 4,
    descriptions: [
      'description-EattleNguyen',
      'bio-EattleNguyen',
    ],
    imageUrl: '/bio/eattle-nguyen.jpg',
    title: 'Eattle Nguyen (Co-Founder/CMO)',
  },
  {
    id: 5,
    descriptions: [
      'description-DaoNguyen',
      'bio-DaoNguyen',
    ],
    imageUrl: '/bio/dao-nguyen.jpg',
    title: 'Dao Nguyen (CPO)',
  },
  {
    id: 6,
    descriptions: [
      'description-KhaiHung',
      'bio-KhaiHung',
    ],
    imageUrl: '/bio/khai-hung.jpg',
    title: 'Khai Hung Luong (CTO)',
  },
  {
    id: 2,
    descriptions: [
      'description-AndyNguyen',
      'bio-AndyNguyen',
    ],
    imageUrl: '/bio/andy-nguyen.jpg',
    title: 'Andy Nguyen (Supervisor)',
  },
]

interface OrgMembersProps {
  locale: string
}

const OrgMembers = async({ locale }: OrgMembersProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['about', 'common'])

  return (
    <div className="px-6 py-32">
      <h1 className="text-center text-3xl font-semibold tracking-wide text-[#7f0000] md:text-4xl lg:text-5xl mb-7">
        {t('header-directors-aboutUs')}
      </h1>
      <Separator className="w-2/3 lg:w-1/2 bg-[#7f0000] place-self-center mb-20" />
      <div className="mx-auto flex max-w-[1500px] flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {memberData.map((member) => (
          <OrgMemberCard key={member.id} locale={locale} {...member} />
        ))}
      </div>
    </div>
  )
}

export default OrgMembers

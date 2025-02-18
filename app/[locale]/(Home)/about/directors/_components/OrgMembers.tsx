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
    imageUrl: 'https://drive.google.com/thumbnail?id=150ts6Imd6vEJDJIu9BSLaoD9xm-FC_4u&sz=w1000',
    title: 'Trong Nguyen (Founder/CEO)',
  },
  {
    id: 2,
    descriptions: [
      'description-EricNguyen',
      'bio-EricNguyen',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=16dN0NDi0FsfBWoBRyK4rjm_yrLRY71ZG&sz=w1000',
    title: 'Tue Nguyen (Co-Founder/COO)',
  },
  {
    id: 3,
    descriptions: [
      'description-KhueLe',
      'bio-KhueLe',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=15m1KsV9oU99fQ6GDpiGYclvbd46R4VAR&sz=w1000',
    title: 'Khue Le (Co-Founder/CHRO)',
  },  
  {
    id: 4,
    descriptions: [
      'description-EattleNguyen',
      'bio-EattleNguyen',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=1gwyOUEkQwoHVOk-pPt1WiV_rHKhirFRT&sz=w1000',
    title: 'Eattle Nguyen (Co-Founder/CMO)',
  },
  {
    id: 5,
    descriptions: [
      'description-DaoNguyen',
      'bio-DaoNguyen',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=1d_6JXNRDej68-yl_4piUdXe47jTlD71p&sz=w1000',
    title: 'Dao Nguyen (CPO)',
  },
  {
    id: 6,
    descriptions: [
      'description-KhaiHung',
      'bio-KhaiHung',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=1mmoqu-ALmc7mJ1ZmY9_Srfcb1AZD-0eh&sz=w1000',
    title: 'Khai Hung Luong (CTO)',
  },
  {
    id: 2,
    descriptions: [
      'description-AndyNguyen',
      'bio-AndyNguyen',
    ],
    imageUrl: 'https://drive.google.com/thumbnail?id=1sx23QaUry-Ed6yJ-whOrOKd4H3_rb0MJ&sz=w1000',
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

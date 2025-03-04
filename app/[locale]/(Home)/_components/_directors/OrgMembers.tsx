import React from 'react'
import OrgMemberCard from './OrgMemberCard'
import { Separator } from '@/components/ui/separator'
import initTranslation from '@/app/i18n'

const directors = [
  {
    id: 1,
    description: 'description-TrongNguyen',
    bio: 'bio-TrongNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=150ts6Imd6vEJDJIu9BSLaoD9xm-FC_4u&sz=w1000',
    name: 'Trong Nguyen',
    title: 'Founder/CEO',
  },
  {
    id: 2,
    description: 'description-EricNguyen',
    bio: 'bio-EricNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=16dN0NDi0FsfBWoBRyK4rjm_yrLRY71ZG&sz=w1000',
    name: 'Eric Nguyen',
    title: 'Co-Founder/COO',
  },
  {
    id: 3,
    description: 'description-KhueLe',
    bio: 'bio-KhueLe',
    imageUrl:
      'https://drive.google.com/thumbnail?id=15m1KsV9oU99fQ6GDpiGYclvbd46R4VAR&sz=w1000',
    name: 'Khue Le',
    title: 'Co-Founder/CHRO',
  },
  {
    id: 4,
    description: 'description-EattleNguyen',
    bio: 'bio-EattleNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1gwyOUEkQwoHVOk-pPt1WiV_rHKhirFRT&sz=w1000',
    name: 'Eattle Nguyen',
    title: 'Co-Founder/CMO',
  },
  {
    id: 5,
    description: 'description-DaoNguyen',
    bio: 'bio-DaoNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1d_6JXNRDej68-yl_4piUdXe47jTlD71p&sz=w1000',
    name: 'Dao Nguyen',
    title: 'CPO',
  },
  {
    id: 6,
    description: 'description-KhaiHung',
    bio: 'bio-KhaiHung',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1mmoqu-ALmc7mJ1ZmY9_Srfcb1AZD-0eh&sz=w1000',
    name: 'Khai Hung',
    title: 'CTO',
  },
]

const honoraryMembers = [
  {
    id: 1,
    description: 'description-AndyNguyen',
    bio: 'bio-AndyNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1sx23QaUry-Ed6yJ-whOrOKd4H3_rb0MJ&sz=w1000',
    name: 'Andy Nguyen',
    title: 'Supervisor',
  },
]

interface OrgMembersProps {
  locale: string
}

const OrgMembers = async ({ locale }: OrgMembersProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['about', 'common'])

  return (
    <div className="flex-col-center py-32">

      {/* Header */}
      <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark lg:text-5xl">
        {t('header-directors-aboutUs')}
      </h1>
      <Separator className="mb-10 w-2/3 bg-bgColor-brandDark lg:w-1/2" />

      {/* Directors */}
      <div className="width-max-default mx-auto flex flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {directors.map((director) => (
          <OrgMemberCard key={director.id} locale={locale} {...director} />
        ))}
      </div>

      {/* Honorary Members */}
      <div className="flex-center px-6 py-14">
        <h1 className="header-sub header-font-default mb-10 text-3xl italic text-textColor-brandDark lg:text-5xl">
          {t('header-honorableMention-aboutUs')}
          <Separator className="mt-2 bg-bgColor-brandDark" />
        </h1>
      </div>
      <div className="width-max-default mx-auto flex flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {honoraryMembers.map((honoraryMember) => (
          <OrgMemberCard key={honoraryMember.id} locale={locale} {...honoraryMember} />
        ))}
      </div>
    </div>
  )
}

export default OrgMembers

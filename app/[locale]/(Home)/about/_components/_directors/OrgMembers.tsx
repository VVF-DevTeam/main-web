// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'

// Components
import OrgMemberCard from './OrgMemberCard'
import { Separator } from '@/components/ui/separator'

// Data
const directors = [
  {
    id: 1,
    description: 'description-TrongNguyen',
    bio: 'bio-TrongNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=150ts6Imd6vEJDJIu9BSLaoD9xm-FC_4u',
    name: 'Trong Nguyen',
    title: 'Founder/CEO',
  },
  {
    id: 2,
    description: 'description-EattleNguyen',
    bio: 'bio-EattleNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1gwyOUEkQwoHVOk-pPt1WiV_rHKhirFRT',
    name: 'Eattle Nguyen',
    title: 'Co-Founder/CMO',
  },
  {
    id: 3,
    description: 'description-DaoNguyen',
    bio: 'bio-DaoNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1d_6JXNRDej68-yl_4piUdXe47jTlD71p',
    name: 'Dao Nguyen',
    title: 'CPO',
  },
  {
    id: 4,
    description: 'description-KhaiHung',
    bio: 'bio-KhaiHung',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1mmoqu-ALmc7mJ1ZmY9_Srfcb1AZD-0eh',
    name: 'Khai Hung Luong',
    title: 'CTO',
  },
  // {
  //   id: 5,
  //   description: 'description-LunaNguyen',
  //   bio: 'bio-LunaNguyen',
  //   imageUrl:
  //     'https://drive.google.com/thumbnail?id=1L6K_DeDyvcpA5hU3uuo4rlDm3mypn6jn',
  //   name: 'Luna Nguyen',
  //   title: 'CHRO',
  // },
]

const honoraryMembers = [
  {
    id: 1,
    description: 'description-AndyNguyen',
    bio: 'bio-AndyNguyen',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1sx23QaUry-Ed6yJ-whOrOKd4H3_rb0MJ',
    name: 'Andy Nguyen',
    title: 'Supervisor/Patron',
  },
]

// Interfaces
interface OrgMembersProps {
  locale: string
}

// Main Component
const OrgMembers = async ({ locale }: OrgMembersProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['about', 'common'])

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Header */}
      <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark900 lg:text-5xl">
        {t('header-directors-aboutUs')}
      </h1>
      <Separator className="mb-10 w-2/3 bg-bgColor-brandDark900 lg:w-1/2" />

      {/* Directors */}
      <div className="width-max-default mx-auto flex flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {directors.map((director) => (
          <OrgMemberCard key={director.id} locale={locale} {...director} />
        ))}
      </div>

      {/* Honorary Members */}
      <div className="flex-center px-6 py-14">
        <h1 className="header-sub header-font-default text-3xl italic text-textColor-brandDark900 lg:text-5xl">
          {t('header-honorableMention-aboutUs')}
          <Separator className="mt-2 bg-bgColor-brandDark900" />
        </h1>
      </div>
      <div className="width-max-default mx-auto flex flex-col gap-y-20 p-6 md:p-12 lg:gap-y-32 lg:p-16">
        {honoraryMembers.map((honoraryMember) => (
          <OrgMemberCard
            key={honoraryMember.id}
            locale={locale}
            {...honoraryMember}
          />
        ))}
      </div>

      {/* All other members */}
      <div className="flex-col-center px-6 py-14 md:w-2/3">
        <p className="pb-5 text-center text-3xl font-bold italic text-textColor-brandDark900">
          {t('header-allmembers')}
        </p>

        <p>
          Julia Dinh (Project Manager), Minh Tue Nguyen (Co-founder), Sally
          Nam (Designer Lead), Elena Trinh (Dance Lead), Stephanie Le, Jerry
          Diep, Ca Heo (Bach), Dat Tran Tuan, Phong Tran, Tony Huynh, Nhi
          Nguyen, Nguyen Tran Le Phan, Loc Pham, Tin Truong, Minh Anh, Hoang
          Pham, Felix Nguyen, Bill Vo, Bui Gia Khanh, Vinh Bao Phu, Doan Thu
          Tra, Luong Quoc Trung, Tang Phuong Minh, Van Le, Dao Gia An, Pham Gia
          Tri, Nguyen Ngoc Thuy Nguyen, Pham Bao Tran, Thi Phuong Thao Nguyen,
          Duc Anh Do, Le Duc Hieu, Thao Pham, Thanh Hang Nguyen, Phu Loc, Huy
          Phan, Nam Phuong Luu, Vi Do, Le Hong Ngoc, Tran Quyet Tien, Tran Chi
          Dat, Vu Tram Anh, Nguyen Uyen Nguyen, Jayant Puri, Luna Nguyen (Former
          CHRO), Khue Le (Former Co-founder).
        </p>
      </div>
    </div>
  )
}

export default OrgMembers

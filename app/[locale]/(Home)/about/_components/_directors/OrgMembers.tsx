// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'

// Components
import DirectorsYearSwitcher from './DirectorsYearSwitcher'
import OrgMemberCard from './OrgMemberCard'
import { Separator } from '@/components/ui/separator'

// Data
import directorsByYearJson from './directors-by-year.json'

type DirectorRecord = {
  id: number
  description: string
  bio: string
  imageUrl: string
  name: string
  title: string
}

const directorsByYear = directorsByYearJson as Record<string, DirectorRecord[]>

const directorPeriodKeys = Object.keys(directorsByYear)
  .filter((k) => (directorsByYear[k]?.length ?? 0) > 0)
  .sort((a, b) => {
    const yA = parseInt(a.slice(0, 4), 10)
    const yB = parseInt(b.slice(0, 4), 10)
    return yB - yA
  })

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
      <DirectorsYearSwitcher
        periodLabels={directorPeriodKeys}
        prevLabel={t('directors-period-prev')}
        nextLabel={t('directors-period-next')}
      >
        {directorPeriodKeys.map((periodKey) => (
          <div
            key={periodKey}
            className="flex flex-col gap-y-20 lg:gap-y-32"
          >
            {directorsByYear[periodKey]?.map((director) => (
              <OrgMemberCard
                key={`${periodKey}-${director.id}`}
                locale={locale}
                {...director}
              />
            ))}
          </div>
        ))}
      </DirectorsYearSwitcher>

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
          Minh Tue Nguyen (Performer/Co-founder), Elena Trinh (Performer/Dance Lead), Stephanie Le (Performer), Dat Tran Tuan (Performer), 
          Jerry Diep, Phong Tran, Nhi Nguyen, Nguyen Tran Le Phan, Loc Pham, Tin Truong, Minh Anh, Hoang
          Pham, Sally Nam (Former Designer Lead), Felix Nguyen, Bill Vo, Bui Gia Khanh, Vinh Bao Phu, Doan Thu
          Tra, Luong Quoc Trung, Tang Phuong Minh, Van Le, Dao Gia An, Pham Gia
          Tri, Nguyen Ngoc Thuy Nguyen, Pham Bao Tran, Thi Phuong Thao Nguyen,
          Duc Anh Do, Le Duc Hieu, Thao Pham, Thanh Hang Nguyen, Phu Loc, Huy
          Phan, Nam Phuong Luu, Vi Do, Le Hong Ngoc, Tran Quyet Tien, Tran Chi
          Dat (Former Co-founder), Vu Tram Anh, Nguyen Uyen Nguyen, Jayant Puri, Luna Nguyen (Former
          CHRO), Khue Le (Former Co-founder).
        </p>
      </div>
    </div>
  )
}

export default OrgMembers

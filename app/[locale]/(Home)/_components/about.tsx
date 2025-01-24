import React from 'react'
import GridCard from './gridCard'
import { Separator } from '@/components/ui/separator'
import { Users, Volleyball, Guitar } from 'lucide-react'
import initTranslation from '@/app/i18n'

const cardsData = [
  {
    id: 1,
    name: 'sportHeader-aboutUs',
    logo: Volleyball,
    desc: 'sportDescription-aboutUs',
  },
  {
    id: 2,
    name: 'musicHeader-aboutUs',
    logo: Guitar,
    desc: 'musicDescription-aboutUs',
  },

  {
    id: 3,
    name: 'volunteerHeader-aboutUs',
    logo: Users,
    desc: 'volunteerDescription-aboutUs',
  },
]
const About = async ({ locale }: { locale: string }) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="bg-[#EFB9A2]/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-y-12 p-12">
        <div className="flex flex-col items-center justify-center gap-y-6 p-6">
          <h2 className="cursor-default text-5xl font-bold tracking-wider text-[#B83AB3] transition-all duration-100 ease-out hover:text-[#B83AB3]/80">
            {t('header-aboutUs')}
          </h2>
          <Separator className="w-1/2 bg-[#B83AB3]" />
          <p className="text-xl text-[#1B171A]/70">
            {t('description-aboutUs')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cardsData.map((card) => (
            <GridCard
              key={card.id}
              name={t(card.name)}
              desc={t(card.desc)}
              logo={card.logo}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default About

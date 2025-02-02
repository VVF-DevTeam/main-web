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
  const { t } = await initTranslation(locale, ['about', 'common'])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-[1500px] flex-col items-center justify-center gap-y-12 p-12">
        <div className="flex flex-col items-center justify-center gap-y-6 p-6">
          <h2 className="cursor-default text-5xl font-bold tracking-wider text-[#7f0000] transition-all duration-100 ease-out hover:text-[#7f0000]/80">
            {t('header-vision-aboutUs')}
          </h2>
          <Separator className="w-1/2 bg-[#7f0000]" />
          <p className="text-xl text-[#1B171A]/70">
            {t('description-vision-aboutUs')}
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

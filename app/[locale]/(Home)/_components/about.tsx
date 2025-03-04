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
    <div className="flex-center min-h-screen">
      <div className="flex-col-center width-max-default default-gap p-12">
        <div className="flex-col-center default-gap p-6">
          <h2 className="cursor-default text-5xl font-bold tracking-wider text-textColor-brandDark">
            {t('header-vision-aboutUs')}
          </h2> 
          <Separator className="w-1/2 bg-bgColor-brandDark" />
          <p className="text-xl text-textColor/70">
            {t('description-vision-aboutUs')}
          </p>
        </div>
        <div className="flex-col-default grid-all-cols-3">
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

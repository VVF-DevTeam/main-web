// Components
import FounderStoryCard from '../_components/_founder/FounderStory'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members & Founders - VVF',
  description: 'Meet our VVF Members and Founders',
  openGraph: {
    title: 'Members & Founders - VVF',
    description: 'Meet our VVF Members and Founders',
  },
}

// Data
const foundingStory = [
  {
    id: 1,
    description:
      'The idea was born in 2024 when a group of passionate friends decided to start an non-profit organization to connect Vietnamese people in Vancouver through arts and cultures.',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1TFVDc5PTJqmk7xpW-81eBWCdkg3skoZ1',
  },
  {
    id: 2,
    description:
      'Before, they were just an amateur acoustic guitar band who were well-known with Friday Chill series, and one day they realized that they needed to do something big to make a difference.',
    imageUrl:
      'https://drive.google.com/thumbnail?id=14lFxrVGnK8_TVhukjnhYsdugObSTp8B6',
  },
  {
    id: 3,
    description:
      "Lead by Trong Nguyen - a dedicated doctor and guitarist, with the support of Josh Tran - the key singer, Eattle Nguyen - the drummer and Khue Le - another the key singer, they started to brainstorm and plan the organization's mission, vision and goals.",
    imageUrl:
      'https://drive.google.com/thumbnail?id=1IcCi98pC_IQ9IrE-J6tay3dAzKSXZshb',
  },
  {
    id: 4,
    description:
      `After months of hard work and gathering more members, our group finally hit the running ground and decided to officially launch in November, 2024. \n (Did you know that our mascots are these cute little penguins?)`,
    imageUrl:
      'https://drive.google.com/thumbnail?id=1HtNEPTTQe47KF_3r95yGDzKv0c9uNASw',
  },
  {
    id: 5,
    description:
      'Our first event was a beginner guitar class in Vancouver, which was a huge success and led to the immense public recognition among the Vietnamese community.',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1tJ4iB4TmA2j_ui16eu6AQS7WSP-XVxn0',
  },
  {
    id: 6,
    description:
      'Since then, the foundation has grown to become a thriving organization that connects Vietnamese people in Vancouver through arts and cultures. Finally, we want to send our thanks for our users - the greatest motivation that we need to keep fighting. Thank you, and see you in our next events.',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1EO8cNCeVbtlpCegRkMYsa92ylatyeDcJ',
  },
]

// Force static generation for this route
export const dynamic = 'force-static'

// Main Component
const Founder = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  return (
    <div className="flex-col-center md:gap-y-30 mx-auto max-w-[1000px] gap-y-20 px-5 py-20 lg:gap-y-40">
      {/* Header */}
      <div className='flex-col-center'>
        <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark900 lg:text-5xl">
          Founding History
        </h1>
        <Separator className="bg-bgColor-brandDark900 w-[120%]" />
      </div>

      {/* Intro */}
      <div className="flex-col-center gap-y-3 text-center">
        <p>Do you know how Viet Vibe Foundation was created?</p>
        <p>Let me tell you the story.</p>
        <p className="pb-10">Keep scrolling to find out!</p>
      </div>

      {/* Founding Story */}
      <div className="flex-col-center md:gap-y-30 gap-y-20 border-black pl-5 max-md:border-l-2 lg:gap-y-40"> {/* Timeline border for small screens */}
        {foundingStory.map((story) => (
          <FounderStoryCard key={story.id} locale={locale} {...story} />
        ))}
      </div>
    </div>
  )
}

export default Founder

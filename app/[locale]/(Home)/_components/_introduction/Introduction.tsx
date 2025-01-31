import IntroCard from './IntroCard'

const introductionData = [
  {
    id: 1,
    descriptions: [
      'From exciting competitions to hands-on skill-building sessions, we invite everyone to join in - regardless of age or experience. Have fun, improve your skills, connect with others, and enjoy being part of a welcoming, vibrant, and inclusive community of sports lovers.',
    ],
    imageUrl: '/bg/tennisInstruction-home.jpg',
    title: 'Sport Lessons and Tournaments',
  },
  {
    id: 2,
    descriptions: [
      'With professional performers, our music lessons and workshops offer participants the opportunity to learn, grow, and connect with the art of music',
    ],
    imageUrl: '/bg/pianoInstruction-home.jpg',
    title: 'Musical Lessons and Workshops',
  },
]

const Introduction = () => {
  return (
    <div className="bg-white">
      <div className="blur-xs flex h-[90vh] flex-col items-center justify-center gap-y-8 bg-[#3a3635] bg-[url(/bg/guitar-background.jpg)] bg-cover bg-no-repeat text-center bg-blend-overlay">
        <h1 className="font-[Poppins] text-2xl tracking-wide text-[#fff7f7] md:text-3xl lg:text-3xl">
          Viet Vibe Foundation
        </h1>
        <h1 className="max-w-[90vw] font-[Poppins] text-4xl font-semibold leading-[3rem] tracking-wider text-[#fff7f7] md:max-w-[80vw] md:text-5xl md:leading-[4rem] lg:max-w-[70vw]">
          Connect Community Through Sports, Musics And Arts
        </h1>
        <p className="max-w-[80vw] font-[Poppins] text-xl tracking-wide text-[#fff7f7] md:max-w-[70vw] md:text-2xl lg:max-w-[60vw] lg:text-2xl">
          A non-profit organization dedicated to fostering creativity,
          innovation, and community engagement in Vancouver.
        </p>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-y-20 p-6 md:p-12 lg:gap-y-24 lg:p-16">
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} {...intro} />
        ))}
      </div>
    </div>
  )
}

export default Introduction

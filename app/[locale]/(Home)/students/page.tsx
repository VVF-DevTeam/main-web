import React from 'react'
import { Users, Volleyball, Guitar, Handshake, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Benefit = {
  title: string
  description: string
  icon: LucideIcon
}

const benefits: Benefit[] = [
  {
    title: 'Sports classes and tournaments',
    description:
      'From exciting competitions to practical skill-building sessions, everyone is welcome to join regardless of age or experience.',
    icon: Volleyball,
  },
  {
    title: 'Music classes and workshops',
    description:
      'Learn and grow with professional performers across instruments and skills such as guitar, piano, drums, and dance.',
    icon: Guitar,
  },
  {
    title: 'Volunteer activities and events',
    description:
      'Join meaningful community activities, build strong connections, and contribute to Vietnamese and international friends in Vancouver.',
    icon: Users,
  },
  {
    title: 'Community connection',
    description:
      'We bring people together through shared languages of sports, music, and collective activities.',
    icon: Handshake,
  },
]

const StudentsPage = () => {
  return (
    <main className='w-full bg-bgColor-white'>
      <section className='bg-bgColor-secondary200 px-6 py-20 md:py-24'>
        <div className='mx-auto flex w-full max-w-5xl flex-col items-center text-center'>
          <h1 className='max-w-4xl text-3xl font-bold leading-tight md:text-5xl'>
            Students get discounted prices for all our events
          </h1>

          <p className='mt-6 max-w-3xl text-base leading-relaxed'>
            Enjoy many fun activities and events such as classes, concerts, and campings. Create unforgettable memories and connections when you are still young!
          </p>

          <Button
            type='button'
            className='mt-10 rounded-full bg-bgColor-brandDark900 px-10 py-6 text-base font-semibold text-textColor-white transition-colors hover:bg-bgColor-brandDark600'
            variant='default'
            size='lg'
          >
            <Link href='/students/verify'>
              Verify Student
            </Link>
          </Button>

          <p className='mt-8 text-xs leading-relaxed text-textColor-brandDark600'>
            Student discount available at accredited colleges and universities.
            Terms and conditions apply.
          </p>
        </div>
      </section>

      <section className='bg-bgColor-white px-6 py-20 md:py-24'>
        <div className='mx-auto w-full max-w-6xl'>
          <h2 className='mx-auto max-w-3xl text-center text-3xl font-extrabold leading-tight md:text-5xl'>
            About us
          </h2>

          <div className='mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'>
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className='flex flex-col items-center text-center'
              >
                <div className='flex h-24 w-24 items-center justify-center rounded-full bg-bgColor-secondary200 text-4xl font-bold text-textColor-brandDark900'>
                  <benefit.icon className='h-10 w-10' />
                </div>
                <h3 className='mt-6 text-2xl font-semibold leading-snug'>
                  {benefit.title}
                </h3>
                <p className='mt-3 text-lg leading-relaxed'>
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default StudentsPage

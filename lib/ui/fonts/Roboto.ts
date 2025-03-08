// Main font for most normal text
import {Roboto} from 'next/font/google'

export const roboto = Roboto({
  weight : ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})
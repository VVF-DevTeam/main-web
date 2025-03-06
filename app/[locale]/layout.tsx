// Libraries
import type { Metadata } from 'next'

// Components
import { Toaster } from '@/components/ui/toaster'

// CSS and CSS Modules
import '@/lib/ui/css/globals.css'
import '@/lib/ui/css/flex.css'
import '@/lib/ui/css/bg.css'
import '@/lib/ui/css/text.css'
import '@/lib/ui/css/headers.css'
import '@/lib/ui/css/grid.css'
import '@/lib/ui/css/dimension.css'
import '@/lib/ui/css/hover.css'
import { taipro } from '@/lib/ui/fonts/TaiHeritagePro'
import { roboto } from '@/lib/ui/fonts/Roboto'

export const metadata: Metadata = {
  title: 'Viet Vibe Foundation',
  description: 'Viet Vibe Foundation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${taipro.variable} ${roboto.variable}`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}

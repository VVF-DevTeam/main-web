// Libraries
import React from 'react'
import { cn } from '@/lib/utils'

// Components
import { LucideIcon } from 'lucide-react'

// Interfaces
interface GridCardProps {
  name: string
  desc: string
  logo?: LucideIcon
}

// Main Component
const GridCard = ({ name, desc, logo: Logo }: GridCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2 p-2 md:p-4 md:gap-y-4">
      {Logo && <Logo className="h-12 w-12 text-textColor-brandDark/70 dark:text-textColor-brand" />}
      <h2
        className={cn(
          !Logo
            ? 'text-start md:self-start text-xl uppercase font-bold text-textColor/80 xl:text-2xl dark:text-gray-300'
            : 'text-center text-3xl font-bold text-textColor/80 dark:text-gray-300'
        )}
      >
        {name}
      </h2>
      <p
        className={cn(
          !Logo
            ? 'text-sm font-extralight text-pretty text-textColor-gray lg:text-base'
            : 'text-muted-foreground'
        )}
      >
        {desc}
      </p>
    </div>
  )
}

export default GridCard

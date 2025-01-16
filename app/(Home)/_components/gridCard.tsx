import { LucideIcon } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
interface GridCardProps {
  name: string
  desc: string
  logo?: LucideIcon
}
const GridCard = ({ name, desc, logo: Logo }: GridCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2 p-2 md:p-4 md:gap-y-4">
      {Logo && <Logo className="h-12 w-12 text-[#B83AB3]/70" />}
      <h2
        className={cn(
          !Logo
            ? 'text-start md:self-start text-xl uppercase font-bold text-[#1B171A]/80 xl:text-2xl'
            : 'text-center text-3xl font-bold text-[#1B171A]/80'
        )}
      >
        {name}
      </h2>
      <p
        className={cn(
          !Logo
            ? 'text-sm font-extralight text-pretty text-gray-700 lg:text-base'
            : 'text-muted-foreground'
        )}
      >
        {desc}
      </p>
    </div>
  )
}

export default GridCard

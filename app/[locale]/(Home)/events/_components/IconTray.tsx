// Libraries
import React from 'react'

// Components
import CustomIcon from '@/app/[locale]/components/CustomIcon'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Interfaces
interface IconTrayProps {
  iconList: {
    id: string
    url: string
    name: string
    icon: string
  }[]
  isLink?: boolean
  color?: string
  width?: number
  height?: number
  gap?: number
}

// Component
const IconTray = ({
  iconList,
  isLink = false,
  color = 'black',
  width = 30,
  height = 30,
  gap = 4,
}: IconTrayProps) => {
  return (
    <div>
      {isLink ? (
        <div className="flex" style={{ gap: `${gap}px` }}>
          {iconList.map((icon) => (
            <TooltipProvider key={icon.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={icon.url}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <CustomIcon
                      src={icon.icon}
                      height={height}
                      width={width}
                      color={color}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="bg-bgColor-black" sideOffset={4}>
                  <p className="text-sm text-textColor-brand600">
                    View {icon.name} of instructor
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      ) : (
        <div className="flex" style={{ gap: `${gap}px` }}>
          {iconList.map((icon) => (
            <TooltipProvider key={icon.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <CustomIcon src={icon.icon} height={height} width={width} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-bgColor-black" sideOffset={4}>
                  <p className="text-sm text-textColor-brand600">
                    View {icon.name} of instructor
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
}

export default IconTray

// Libraries
import React from 'react'

// Components
import CustomIcon from '@/app/[locale]/components/CustomIcon'
import Link from 'next/link'

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
}

// Component
const IconTray = ({ iconList, isLink = false, color = 'black' }: IconTrayProps) => {
  return (
    <div>
      {isLink ? (
        <div className="flex gap-x-4">
          {iconList.map((icon) => (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={icon.url}
              key={icon.id}
              className="transition-transform duration-300 hover:scale-105"
            >
              <CustomIcon src={icon.icon} height={30} width={30} color={color} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex gap-x-4">
          {iconList.map((icon) => (
            <CustomIcon key={icon.id} src={icon.icon} height={30} width={30} />
          ))}
        </div>
      )}
    </div>
  )
}

export default IconTray

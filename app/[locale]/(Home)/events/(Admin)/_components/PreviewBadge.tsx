import React from 'react'

interface PreviewBadgeProps {
  title: string
  textColor: string
  bgColor: string
  isBold: boolean
  isItalic: boolean
  helperText: string | null
  onClick?: () => void
}
const PreviewBadge = ({
  title,
  bgColor,
  textColor,
  isBold,
  isItalic,
  helperText,
  onClick,
}: PreviewBadgeProps) => {
  return (
    <div className="flex flex-col items-center place-self-center">
     {helperText && <h3 className="mb-6 font-bold text-gray-800 md:text-xl">
        {helperText}
      </h3>}
      <div
        onClick={onClick}
        style={{
          backgroundColor: `${bgColor}`,
          color: `${textColor}`,
          fontStyle: isItalic ? 'italic' : 'normal',
          fontWeight: isBold ? 'bold' : 'normal',
        }}
        className={`max-w-fit rounded-full px-3 py-2 text-xl tracking-wide ${onClick ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
      >
        {title}
      </div>
    </div>
  )
}

export default PreviewBadge

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ImageUploadButtonProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
  accept?: string
  children?: React.ReactNode
  className?: string
  inputClassName?: string
}

export function ImageUploadButton({
  onChange,
  disabled,
  accept = 'image/*',
  children = 'Upload Image File',
  className,
  inputClassName,
}: ImageUploadButtonProps) {
  return (
    <div>
      <label
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm bg-bgColor-gray100 hover:bg-bgColor-gray300',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
      >
        {children}
        <input
          type="file"
          className={cn('hidden', inputClassName)}
          accept={accept}
          onChange={onChange}
          disabled={disabled}
        />
      </label>
    </div>
  )
}

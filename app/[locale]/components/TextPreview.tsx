'use client'
import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

import 'react-quill/dist/quill.snow.css'
interface TextPreviewProps {
  value: string
}
const TextPreview = ({ value }: TextPreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill-new'), { ssr: false }),
    []
  )

  // return <ReactQuill className="h-fit text-gray-900 dark:text-muted-foreground" theme="bubble" value={value} readOnly />
  return (
    <div className="text-gray-900 dark:text-muted-foreground">
    <ReactQuill className="h-fit" theme="bubble" value={value} readOnly />
  </div>
  )
}

export default TextPreview

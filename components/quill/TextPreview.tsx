'use client'
import React from 'react'

import 'react-quill-new/dist/quill.bubble.css'

interface TextPreviewProps {
  value: string
}

const TextPreview = ({ value }: TextPreviewProps) => {
  return (
    <div
      className="ql-editor !py-0 !min-h-0 !h-auto"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

export default TextPreview

'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { Quill } from 'react-quill-new'

interface EditorProps {
  onChange: (value: string) => void
  value: string
}

interface QuillToolbarContext {
  quill: Quill
}

// Extend window to include Quill (to avoid TS error)
declare global {
  interface Window {
    Quill?: typeof Quill
  }
}

const Editor = ({ onChange, value }: EditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill-new'), { ssr: false }),
    []
  )

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: '1' }, { header: '2' }, { header: '3' }, { font: [] }],
          [{ color: [] }, { background: [] }],
          [{ size: [] }],
          [{ align: 'justify' }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['link', 'image', 'video'],
          ['code-block'],
          ['clean'],
        ],
        handlers: {
          image: function (this: QuillToolbarContext) {
            const url = prompt('Enter image URL')
            if (url) {
              const range = this.quill.getSelection()
              this.quill.insertEmbed(range?.index || 0, 'image', url)
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  )

  const formats = [
    'header',
    'align',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'blockquote',
    'list',
    'indent',
    'link',
    'image',
    'video',
    'direction',
    'code-block',
  ]

  return (
    <ReactQuill
      className="h-fit w-full"
      theme="snow"
      modules={modules}
      formats={formats}
      value={value}
      onChange={onChange}
    />
  )
}

export default Editor
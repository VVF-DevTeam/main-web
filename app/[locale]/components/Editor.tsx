'use client'
import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

interface EditorProps {
  onChange: (value: string) => void
  value: string
}
const Editor = ({ onChange, value }: EditorProps) => {
  const ReactQuill = useMemo(() => {
    return dynamic(() => import('react-quill-new'), { ssr: false })
  }, [])

  return (
    <ReactQuill
      className="h-fit w-full"
      theme="snow"
      modules={{
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
        },
        clipboard: {
          matchVisual: false,
        },
      }}
      formats={[
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
      ]}
      value={value}
      onChange={onChange}
    />
  )
}

export default Editor

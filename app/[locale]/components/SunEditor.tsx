'use client'
import React from 'react'
// import { useRef } from 'react'
import dynamic from 'next/dynamic'
import 'suneditor/dist/css/suneditor.min.css'
const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false,
})

interface EditorProps {
  onChange: (value: string) => void
  value: string
}

const MyComponent = ({ onChange, value }: EditorProps) => {
  // const editorRef = useRef()
  // const getSunEditorInstance = (sunEditor) => {
  //   editorRef.current = sunEditor
  // }
  return (
    <div>
      <p> My Other Contents </p>
      <SunEditor
        defaultValue="<p>The editor's default value</p>"
        width="100%"
        height="100%"
        onChange={onChange}
        setContents={value}
        setOptions={{
          buttonList: [['font', 'align'], ['image']],
        }}
      />
    </div>
  )
}
export default MyComponent

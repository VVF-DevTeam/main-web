'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { Quill } from 'react-quill-new'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { getValidGoogleDriveImageUrl } from '@/lib/utilFunctions/gdrive-loader'
import Loader from '@/components/loader/Loader'

interface EditorProps {
  onChange: (value: string) => void
  value: string
}

interface QuillToolbarContext {
  quill: Quill
}

/** Snow-themed icon: small image frame + upload arrow (uses .ql-stroke / .ql-fill for toolbar hover). */
const IMAGE_UPLOAD_TOOLBAR_SVG = `<svg class="ql-imageUpload-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect class="ql-stroke" x="1" y="6" width="8" height="6.5" rx="1" fill="none"/>
  <circle class="ql-fill" cx="3.2" cy="8.1" r="0.85"/>
  <path class="ql-stroke" fill="none" d="M2 11.2l1.6-1.2 1.6 1.2 1.4-1.8"/>
  <path class="ql-stroke" fill="none" d="M12 2.5v5.5"/>
  <path class="ql-stroke" fill="none" d="M9.5 5L12 2.5 14.5 5"/>
</svg>`

// Extend window to include Quill (to avoid TS error)
declare global {
  interface Window {
    Quill?: typeof Quill
  }
}

const Editor = ({ onChange, value }: EditorProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const setImageUploadLoadingRef = useRef(setImageUploadLoading)
  setImageUploadLoadingRef.current = setImageUploadLoading

  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill-new'), { ssr: false }),
    []
  )

  useEffect(() => {
    let cancelled = false
    const syncImageUploadIcon = () => {
      if (cancelled) return
      const root = rootRef.current
      if (!root) return
      const toolbar = root.querySelector<HTMLElement>('.ql-toolbar.ql-snow')
      if (!toolbar) return
      const uploadBtn = toolbar.querySelector<HTMLButtonElement>(
        'button.ql-imageUpload'
      )
      if (!uploadBtn || uploadBtn.querySelector('svg.ql-imageUpload-icon')) return
      uploadBtn.innerHTML = IMAGE_UPLOAD_TOOLBAR_SVG
      uploadBtn.setAttribute('title', 'Upload image from file')
      uploadBtn.setAttribute('aria-label', 'Upload image from file')
    }

    const timeouts = [0, 50, 150, 400].map((ms) =>
      window.setTimeout(syncImageUploadIcon, ms)
    )
    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [])

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
          ['link', 'image', 'imageUpload', 'video'],
          ['code-block'],
          ['clean'],
        ],
        handlers: {
          image: function (this: QuillToolbarContext) {
            const url = getValidGoogleDriveImageUrl(
              prompt('Enter image URL') || '',
              true
            )
            if (url) {
              const range = this.quill.getSelection(true)
              this.quill.insertEmbed(range?.index ?? 0, 'image', url)
            }
          },
          imageUpload: function (this: QuillToolbarContext) {
            const quill = this.quill
            const sizeRaw = prompt(
              'Enter image width for Google Drive (e.g. 800 → &sz=w800)',
              '800'
            )
            if (sizeRaw === null) return
            const size = sizeRaw.trim()
            if (!size || !/^\d+$/.test(size)) {
              toast.error('Please enter a positive whole number for width')
              return
            }
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async () => {
              const file = input.files?.[0]
              input.value = ''
              if (!file) return
              const formData = new FormData()
              formData.append('file', file)
              setImageUploadLoadingRef.current(true)
              try {
                const response = await axiosInstance.post(
                  '/api/quills/images',
                  formData,
                  {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  }
                )
                if (response.status !== 200) {
                  toast.error('Failed to upload image')
                  return
                }
                const baseUrl =
                  getValidGoogleDriveImageUrl(response.data.url, true) ??
                  response.data.url
                if (baseUrl) {
                  const szParam = `sz=w${size}`
                  const urlWithSz = baseUrl.includes('?')
                    ? `${baseUrl}&${szParam}`
                    : `${baseUrl}?${szParam}`
                  const range = quill.getSelection(true)
                  quill.insertEmbed(range?.index ?? 0, 'image', urlWithSz)
                }
              } catch (err) {
                console.error('Quill image upload:', err)
                toast.error('Failed to upload image')
              } finally {
                setImageUploadLoadingRef.current(false)
              }
            }
            input.click()
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
    <>
      {imageUploadLoading && <Loader />}
      <div ref={rootRef} className="h-fit w-full">
        <ReactQuill
          className="h-fit w-full"
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  )
}

export default Editor
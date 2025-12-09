'use client'

// Libraries
import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useDebounce from '@/hooks/useDebounce'
import queryString from 'query-string'

// Components
import { Search } from 'lucide-react'

// Interfaces & Types
interface SearchBoxProps {
  placeholders?: string[]
}

const SearchBox = ({ placeholders }: SearchBoxProps) => {
  const [value, setValue] = useState('')
  const [index, setIndex] = useState(0)

  // check if placeholders is null
  placeholders = placeholders || []

  const currentPath = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category')

  const debouncedValue = useDebounce(value, 1000)

  const placeholderRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // UseEffect for debouncing to set the url search query
  useEffect(() => {
    // Get all existing search parameters
    const currentParams = Object.fromEntries(searchParams.entries())
    
    const url = queryString.stringifyUrl(
      {
        url: currentPath,
        query: {
          ...currentParams, // Preserve existing parameters
          title: debouncedValue,
          category: category === null ? null : category,
        },
      },
      { skipNull: true, skipEmptyString: true }
    )

    router.push(url, { scroll: false })
  }, [debouncedValue, searchParams, currentPath, category])

  // UseEffect for dynamically changing placeholders.
  useEffect(() => {
    if (value.length !== 0) return
    const interval = setInterval(() => {
      changePlaceHolder()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [value])

  const changePlaceHolder = () => {
    setIndex((prev) => {
      prev = prev === placeholders.length - 1 ? 0 : prev + 1
      return prev
    })
  }

  const onChange = (val: string) => {
    setValue(val)

    if (!placeholderRef.current) return

    if (val.length !== 0) {
      placeholderRef.current.style.display = 'none'
      placeholderRef.current.style.animation = 'none'
    } else {
      placeholderRef.current.style.display = 'inline-block'
    }
  }

  const onBlur = () => {
    if (!placeholderRef.current) return
    if (value.length === 0) {
      placeholderRef.current.style.display = 'inline-block'
    } else if (value.length !== 0) {
      placeholderRef.current.style.display = 'none'
      placeholderRef.current.style.animation = 'none'
    }
  }

  return (
    <div className="flex w-80 items-center rounded-lg bg-slate-100 px-4">
      <div>
        <Search className="h-6 w-6 text-slate-400" />
      </div>
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex w-full items-center overflow-hidden text-[16px]"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onBlur()}
          placeholder="Search"
          className="h-full w-full border-none bg-inherit px-3 py-3 text-slate-900 outline-none placeholder:text-slate-600 focus:outline-none"
        />
        <div
          id="dynamic-placeholder"
          ref={placeholderRef}
          className="pointer-events-none absolute left-[70px] top-[9px] animate-placeHolderFade text-slate-600"
        >
          <span>{placeholders[index] ? placeholders[index] : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBox

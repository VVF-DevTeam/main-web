'use client'
import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import useDebounce from '@/hooks/useDebounce'
import queryString from 'query-string'

const placeholders = ['Friday Chill', 'Guitar class', 'Tennis']
const SearchBox = () => {
  const [value, setValue] = useState('')
  const [index, setIndex] = useState(0)

  const currentPath = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category')

  const debouncedValue = useDebounce(value, 500)

  const placeholderRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // UseEffect for debouncing to set the url seach query
  useEffect(() => {
    const url = queryString.stringifyUrl(
      {
        url: currentPath,
        query: {
          title: debouncedValue,
          category: category === null ? null : category,
        },
      },
      { skipNull: true, skipEmptyString: true }
    )

    router.push(url, { scroll: false })
  }, [debouncedValue])

  // UseEffect for dynamically changing placeholders.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (value.length !== 0 && interval !== null) {
      clearInterval(interval)
      return
    }

    interval = setInterval(() => {
      changePlaceHolder()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [value])

  // UseEffect for selecting placeholder

  const changePlaceHolder = () => {
    setIndex((prev) => {
      prev = prev === placeholders.length - 1 ? 0 : prev + 1
      return prev
    })
  }

  const placeholderHidden = (val: string) => {
    setValue(val)

    if (!placeholderRef.current) return

    if (val.length !== 0) {
      placeholderRef.current.style.display = 'none'
    } else {
      placeholderRef.current.style.display = 'inline-block'
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
          onChange={(e) => placeholderHidden(e.target.value)}
          onBlur={() => {
            if (!placeholderRef.current) return
            if (value.length === 0) {
              placeholderRef.current.style.display = 'inline-block'
            } else if (value.length !== 0) {
              placeholderRef.current.style.display = 'none'
            }
          }}
          placeholder="Search"
          className="h-full w-full border-none bg-inherit px-3 py-3 text-slate-900 outline-none placeholder:text-slate-600 focus:outline-none"
        />
        <div
          id="dynamic-placeholder"
          ref={placeholderRef}
          className="pointer-events-none absolute left-[68px] top-[10px] animate-placeHolderFade text-slate-600"
        >
          <span className="transition-all">{placeholders[index]}</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBox

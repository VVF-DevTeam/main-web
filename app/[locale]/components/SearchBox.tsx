'use client'
import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const placeholders = ['Friday Chill', 'Guitar class', 'Tennis']
const SearchBox = () => {
  const [value, setValue] = useState('')
  const [index, setIndex] = useState(0)
  const changePlaceHolder = () => {
    setIndex((prev) => {
      prev = prev === placeholders.length - 1 ? 0 : prev + 1
      return prev
    })
  }

  const placeholderHidden = () => {
    const dynamicPlaceholder = document.getElementById('dynamic-placeholder')
    if (!dynamicPlaceholder) return
    console.log(value)
    if (value.length !== 0) {
      dynamicPlaceholder.style.display = 'none'
    } else {
      dynamicPlaceholder.style.display = 'inline-block'
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      changePlaceHolder()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex w-80 items-center bg-red-200/70">
      <div>
        <Search className="h-6 w-6" />
      </div>
      <div className="relative flex w-full items-center overflow-hidden text-[16px]">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => placeholderHidden()}
          onBlur={() => placeholderHidden()}
          placeholder="Search"
          className="h-full w-full rounded-lg border-none bg-slate-200 px-3 py-3 text-slate-900 outline-none placeholder:text-slate-600 focus:outline-none"
        />
        <div
          id="dynamic-placeholder"
          className="animate-placeHolderFade absolute left-[68px] top-[10px] text-slate-600"
        >
          <span className="pointer-events-none transition-all">
            {placeholders[index]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SearchBox

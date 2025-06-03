'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

interface EmailProps {
  email: string
  name: string | null
}

interface EmailSuggestionProps {
  field: {
    value: string[]
    onChange: (val: string[]) => void
  }
  emails: EmailProps[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handleAddEmail = (
  inputValue: string,
  field: { value: string[]; onChange: (val: string[]) => void }
) => {
  const val = inputValue.trim()
  if (val) {
    if (EMAIL_REGEX.test(val)) {
      if (!field.value.includes(val)) {
        field.onChange([...field.value, val])
      }
      return '' // Clear input
    } else {
      toast.error('Please enter a valid email', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {new Date().toLocaleString()}
          </span>
        ),
        style: { color: '#ef4444' }, // red-500
      })
    }
  }
  return inputValue // Keep current value if invalid
}

const EmailSuggestion = ({ field, emails }: EmailSuggestionProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const value = field.value
  return (
    <FormItem>
      <FormLabel>To</FormLabel>
      <FormControl>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-1 rounded-md border px-2 py-1 focus-within:ring-2 focus-within:ring-bgColor-black">
            {value.map((email) => (
              <div
                key={email}
                className="flex items-center rounded-full bg-bgColor-grayLight px-3 py-1 text-sm"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() =>
                    field.onChange(value.filter((e) => e !== email))
                  }
                  className="text-textColor-black ml-2 hover:text-textColor-red"
                >
                  &times;
                </button>
              </div>
            ))}

            <input
              type="text"
              placeholder="Recipients"
              className="min-w-[150px] flex-1 border-none text-sm outline-none"
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e) => {
                const clearedValue = handleAddEmail(
                  e.currentTarget.value,
                  field
                )
                e.currentTarget.value = clearedValue
                setShowSuggestions(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const clearedValue = handleAddEmail(
                    e.currentTarget.value,
                    field
                  )
                  e.currentTarget.value = clearedValue
                }
              }}
            />
          </div>

          {showSuggestions && emails.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-bgColor text-black shadow-md">
              {emails.map((e) => {
                const email = e.email
                const name = e.name || email
                if (!email) return null
                return (
                  <button
                    type="button"
                    key={email}
                    onMouseDown={() => {
                      if (!value.includes(email)) {
                        field.onChange([...value, email])
                      }
                      setShowSuggestions(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-bgColor-grayLight"
                  >
                    {name} ({email})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default EmailSuggestion

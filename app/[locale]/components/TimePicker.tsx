import React from 'react'
interface TimePickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  isEditable: boolean
}

const TimePicker = ({
  value,
  onChange,
  label,
  isEditable,
}: TimePickerProps) => {
 
  return (
    <div className="mx-auto flex max-w-[200px] items-center gap-x-4">
      {label && (
        <label className="block font-medium text-gray-900">{label}</label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 end-0 top-0 flex cursor-pointer items-center pe-3.5">
          <svg
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="inherit"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="time"
          id="time"
          disabled={isEditable}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm leading-none text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          style={{
            backgroundColor: !isEditable ? 'white' : 'transparent',
            borderColor: !isEditable ? 'gray' : 'transparent',
            color: !isEditable ? 'black' : 'gray',
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>
    </div>
  )
}

export default TimePicker

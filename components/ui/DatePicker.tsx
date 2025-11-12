'use client'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import React from 'react'

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date) => void
  disabled?: boolean
}
const DatePicker = ({ value, onChange, disabled }: DatePickerProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <DayPicker
        role="dialog"
        aria-label="Select a date"
        mode="single"
        required
        hideNavigation
        captionLayout="dropdown"
        fixedWeeks
        endMonth={new Date(2040, 1)}
        startMonth={new Date(2024, 1)}
        selected={value}
        onSelect={onChange}
        className="w-full max-w-[470px] rounded-lg bg-gray-200 p-4 shadow-md overflow-auto"
        disabled={disabled}
      />
    </div>
  )
}

export default DatePicker

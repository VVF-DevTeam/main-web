'use client'

import { useState } from 'react'
import { ChevronDown, Menu } from 'lucide-react'

export default function Sidebar({
  onSelect,
}: {
  onSelect: (component: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState('contact-info')

  const components = {
    'contact-info': 'Contact Info',
    'change-password': 'Password',
    'delete-account': 'Delete Account',
  }

  const handleSelect = (component: string) => {
    setSelectedComponent(component)
    onSelect(component)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full bg-gray-200 p-4 md:w-64 md:p-6">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-lg font-semibold text-gray-800 md:hidden"
        aria-label="Toggle Sidebar"
      >
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <span>
            {components[selectedComponent as keyof typeof components]}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Sidebar Menu */}
      <div
        className={`absolute left-0 w-full rounded-lg bg-gray-200 p-4 shadow-md transition-all duration-300 md:static md:block md:shadow-none ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <h2 className="mb-4 hidden text-xl font-semibold text-gray-900 md:block">
          Account Settings
        </h2>

        <ul className="space-y-4">
          {Object.entries(components).map(([key, label]) => (
            <li key={key}>
              <button
                onClick={() => handleSelect(key)}
                className={`block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors ${
                  selectedComponent === key
                    ? 'bg-white font-medium text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

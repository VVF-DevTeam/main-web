import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// Mock Next.js font imports
vi.mock('next/font/google', () => ({
  Tai_Heritage_Pro: vi.fn(() => ({
    style: { fontFamily: 'Tai Heritage Pro' },
    variable: '--font-tai-pro',
    className: 'font-tai-pro'
  })),
  Roboto: vi.fn(() => ({
    style: { fontFamily: 'Roboto' },
    variable: '--font-roboto',
    className: 'font-roboto'
  }))
}))

// Mock CSS imports
vi.mock('@/lib/ui/css/globals.css', () => ({}))
vi.mock('@/lib/ui/fonts/TaiHeritagePro', () => ({
  taipro: {
    style: { fontFamily: 'Tai Heritage Pro' },
    variable: '--font-tai-pro',
    className: 'font-tai-pro'
  }
}))
vi.mock('@/lib/ui/fonts/Roboto', () => ({
  roboto: {
    style: { fontFamily: 'Roboto' },
    variable: '--font-roboto',
    className: 'font-roboto'
  }
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
}) 
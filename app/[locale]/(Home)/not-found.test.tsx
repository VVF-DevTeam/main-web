import { describe, test, expect, vi } from 'vitest'
import NotFound from './not-found'
import { render, screen } from '@testing-library/react'

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('/en/not-found'),
  }),
}))

// Mock i18n config
vi.mock('@/i18nConfig', () => ({
  default: {
    locales: ['en', 'fr', 'vi'],
    defaultLocale: 'en',
  },
}))

// Mock i18n translation
vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        notFound: '404 - Page Not Found',
        notFoundDescription: 'The page you are looking for does not exist.',
        goHome: 'Go Home',
      }
      return translations[key] || key
    },
  }),
}))

// Test
describe('renders not found page', () => {
  test('renders not found page', async () => {
    const jsx = await NotFound()
    render(jsx)
    
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  test('renders image with correct attributes', async () => {
    const jsx = await NotFound()
    render(jsx)
    
    const image = screen.getByAltText('Not Found')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://drive.google.com/thumbnail?id=19tM0WbHYTAMlN_y8MkpYs8ZxoXUMAZYD&sz=w2000')
    expect(image).toHaveAttribute('width', '450')
    expect(image).toHaveAttribute('height', '450')
  })
})
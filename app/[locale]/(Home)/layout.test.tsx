import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from './layout'
import React from 'react'

// Mock async server components
vi.mock('@/app/[locale]/(Home)/_components/footer', () => ({
  __esModule: true,
  default: ({ locale }: { locale: string }) => (
    <div data-testid="footer">Footer: {locale}</div>
  ),
}))
vi.mock('@/app/[locale]/(Home)/_components/navbar', () => ({
  __esModule: true,
  default: ({ locale }: { locale: string }) => (
    <div data-testid="navbar">Navbar: {locale}</div>
  ),
}))
vi.mock('@/app/[locale]/(Home)/_components/copyright', () => ({
  __esModule: true,
  default: ({ locale }: { locale: string }) => (
    <div data-testid="copyright">Copyright: {locale}</div>
  ),
}))
// Mock client component
vi.mock('@/app/[locale]/(Home)/_components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}))

describe('Layout (Home)', () => {
  test('renders children and all layout sections', async () => {
    const mockParams = Promise.resolve({ locale: 'en' })
    const TestChild = () => <div data-testid="test-child">Test Content</div>

    // Layout is an async component
    const LayoutElement = await Layout({
      children: <TestChild />,
      params: mockParams,
    })
    render(LayoutElement)

    // Check for all mocked layout sections
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toHaveTextContent('Navbar: en')
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer: en')
    expect(screen.getByTestId('copyright')).toHaveTextContent('Copyright: en')
    // Check children
    expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content')
  })
})

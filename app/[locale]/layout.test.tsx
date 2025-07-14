import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import RootLayout from './layout'

// Mock the dependencies
jest.mock('@/components/translator/TranslationsProvider', () => {
  return function MockTranslationsProvider({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <div data-testid="translations-provider">{children}</div>
  }
})

jest.mock('@/app/i18n', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    resources: {},
  } as never),
}))

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}))

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="analytics" />,
}))

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid="sonner-toaster" />,
}))

describe('RootLayout', () => {
  const mockParams = Promise.resolve({ locale: 'en' })

  it('renders layout with children', async () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>

    const Layout = await RootLayout({
      children: <TestChild />,
      params: mockParams,
    })

    render(Layout)

    // Check that the translations provider is rendered
    expect(screen.getByTestId('translations-provider')).toBeInTheDocument()

    // Check that the test child is rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()

    // Check that the main element exists
    expect(screen.getByRole('main')).toBeInTheDocument()

    // Check that the HTML structure is correct
    const htmlElement = document.querySelector('html')
    expect(htmlElement).toHaveAttribute('lang', 'en')

    const bodyElement = document.querySelector('body')
    expect(bodyElement).toHaveClass('antialiased')
    expect(bodyElement).toHaveClass('min-w-full')
  })

  it('includes all required components', async () => {
    const Layout = await RootLayout({
      children: <div>Test</div>,
      params: mockParams,
    })

    render(Layout)

    // Check that all the main components are rendered
    expect(screen.getByTestId('translations-provider')).toBeInTheDocument()
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument()
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
    expect(screen.getByTestId('speed-insights')).toBeInTheDocument()
  })
})

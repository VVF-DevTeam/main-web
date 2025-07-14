import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout from './layout'

// Mock the dependencies
vi.mock('@/components/translator/TranslationsProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="translations-provider">{children}</div>
  }
}))

vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    resources: {}
  })
}))

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />
}))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="analytics" />
}))

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="sonner-toaster" />
}))

describe('RootLayout', () => {
  const mockParams = Promise.resolve({ locale: 'en' })
  
  test('renders layout with children and providers', async () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>
    
    const Layout = await RootLayout({
      children: <TestChild />,
      params: mockParams
    })
    
    render(Layout)
    
    // Check that the translations provider is rendered
    expect(screen.getByTestId('translations-provider')).toBeInTheDocument()
    
    // Check that the test child is rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    
    // Check that the main element exists
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('includes all required components', async () => {
    const Layout = await RootLayout({
      children: <div>Test</div>,
      params: mockParams
    })
    
    render(Layout)
    
    // Check that all the main components are rendered
    expect(screen.getByTestId('translations-provider')).toBeInTheDocument()
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument()
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
    expect(screen.getByTestId('speed-insights')).toBeInTheDocument()
  })
})

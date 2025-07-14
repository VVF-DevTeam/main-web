import { describe, test, expect, vi } from 'vitest'
import HomeLoadingPage from './loading'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/loadingSkeleton/EventsSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="events-skeleton">Events Skeleton</div>,
}))

describe('HomeLoadingPage', () => {
  test('renders events skeleton', () => {
    render(<HomeLoadingPage />)
    expect(screen.getByTestId('events-skeleton')).toBeInTheDocument()
  })
})

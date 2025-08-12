import { describe, test, expect, vi } from 'vitest'
import Home from './page'
import { render, screen } from '@testing-library/react'

// Mock components
vi.mock('@/app/[locale]/(Home)/_components/imageCarousel', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="image-carousel">Image Carousel: {params.locale}</div>
  ),
}))

vi.mock('@/app/[locale]/(Home)/_components/_socialmediaposts/SocialMediaPosts', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="social-media-posts">
      Social Media Posts: {params.locale}
    </div>
  ),
}))

vi.mock('@/app/[locale]/(Home)/_components/directors', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="directors">Directors: {params.locale}</div>
  ),
}))

vi.mock('@/app/[locale]/(Home)/_components/joinUs', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="join-us">Join Us: {params.locale}</div>
  ),
}))

vi.mock('@/app/[locale]/(Home)/_components/_introduction/Introduction', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="introduction">Introduction: {params.locale}</div>
  ),
}))

vi.mock('@/app/[locale]/(Home)/_components/contact', () => ({
  __esModule: true,
  default: (params: { locale: string }) => (
    <div data-testid="contact">Contact: {params.locale}</div>
  ),
}))

// Test
describe('Home', () => {
  test('renders children and all layout sections', async () => {
    const mockParams = Promise.resolve({ locale: 'en' })
    const jsx = await Home({ params: mockParams })
    render(jsx)

    expect(screen.getByTestId('image-carousel')).toHaveTextContent(
      'Image Carousel: en'
    )
    expect(screen.getByTestId('social-media-posts')).toHaveTextContent(
      'Social Media Posts: en'
    )
    expect(screen.getByTestId('directors')).toHaveTextContent('Directors: en')
    expect(screen.getByTestId('join-us')).toHaveTextContent('Join Us: en')
    expect(screen.getByTestId('introduction')).toHaveTextContent(
      'Introduction: en'
    )
  })
})

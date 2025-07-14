import { describe, test, expect, vi } from 'vitest'
import Footer from './footer'
import { render, screen } from '@testing-library/react'
import { navRoutes } from '@/lib/navRoutes'

vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))

vi.mock('@radix-ui/react-separator', () => ({
  Separator: () => <div data-testid="separator" />,
}))

vi.mock('react-icons/si', () => ({
  SiFacebook: () => <div data-testid="facebook-icon" />,
  SiInstagram: () => <div data-testid="instagram-icon" />,
}))

describe('Footer', () => {
  test('renders the footer with all elements', async () => {
    const jsx = await Footer({ locale: 'en' })
    render(jsx)

    // Check main footer structure
    expect(screen.getAllByTestId('separator')).toHaveLength(2)

    // Check navigation routes
    navRoutes.forEach((route) => {
      expect(screen.getByText(route.label.toLowerCase() + '-footer')).toBeInTheDocument()
    })

    // Check policy link
    expect(screen.getByText('policy-footer')).toBeInTheDocument()

    // Check contact information (email and address)
    expect(screen.getByText('contactUs-footer'.toUpperCase())).toBeInTheDocument()
    expect(screen.getByText('address-footer')).toBeInTheDocument()
    expect(screen.getByText('email-footer')).toBeInTheDocument()

    // Check social media links
    const facebookLink = screen.getByLabelText('Facebook Page')
    const instagramLink = screen.getByLabelText('Instagram Page')
    expect(facebookLink).toBeInTheDocument()
    expect(instagramLink).toBeInTheDocument()
    expect(facebookLink).toHaveAttribute('href', expect.stringContaining('facebook.com'))
    expect(instagramLink).toHaveAttribute('href', expect.stringContaining('instagram.com'))
    
    // Check that icons are rendered
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
  })
})

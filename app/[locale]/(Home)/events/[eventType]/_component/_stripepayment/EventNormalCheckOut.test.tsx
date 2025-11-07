import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventNormalCheckOut from './EventNormalCheckOut'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { getRemainSessions } from '@/lib/actions/event/getRemainSessions'

// Mock dependencies
vi.mock('@/lib/actions/payment/checkSubscription')
vi.mock('@/lib/actions/event/getRemainSessions')
vi.mock('@/components/payment/NormalCheckoutButton', () => ({
  __esModule: true,
  default: ({ 
    buttonText, 
    type, 
    price, 
    numberSession, 
    stripePriceId 
  }: {
    buttonText: string
    type: string
    price?: number
    numberSession?: number
    stripePriceId: string
  }) => (
    <div data-testid="normal-checkout-button">
      <span data-testid="button-text">{buttonText}</span>
      <span data-testid="payment-type">{type}</span>
      <span data-testid="price">{price}</span>
      <span data-testid="sessions">{numberSession}</span>
      <span data-testid="stripe-price-id">{stripePriceId}</span>
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'reserve-button': 'Reserve',
        'payment-membershipIntro': 'Get discounted prices with',
        'sessions': 'sessions',
        'buy-tickets': 'Buy Tickets',
      }
      return translations[key] || key
    },
  }),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ 
    children, 
    href, 
    ...props 
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockCheckSubscription = vi.mocked(checkSubscription)
const mockGetRemainSessions = vi.mocked(getRemainSessions)

const defaultProps = {
  stripePriceId: 'price_123',
  stripeProductId: 'prod_123',
  eventKeyName: 'test-event',
  userId: 'user_123',
  eventId: 'event_123',
  stripeSubscribedPriceId: 'price_sub_123',
  price: 25,
  fullCourseDiscount: 20,
  email: 'test@example.com',
  type: 'Class',
}

describe('EventNormalCheckOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(8)
  })

  test('renders loading state initially', () => {
    render(<EventNormalCheckOut {...defaultProps} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders drop-in payment option for non-subscribed user', async () => {
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(8)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should show membership intro for non-subscribed users
    expect(screen.getByText('Get discounted prices with', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('membership')).toBeInTheDocument()

    // Should show drop-in option selected by default
    const dropInRadio = screen.getByLabelText(/Drop-in.*\(25\$\)/)
    expect(dropInRadio).toBeChecked()

    // Should show full course option for Class type
    expect(screen.getByLabelText(/Full course - 8 sessions \(20% off\).*\(160\$\)/)).toBeInTheDocument()

    // Should render NormalCheckoutButton with correct props
    expect(screen.getByTestId('normal-checkout-button')).toBeInTheDocument()
    expect(screen.getByTestId('payment-type')).toHaveTextContent('ClassDropIn')
    expect(screen.getByTestId('stripe-price-id')).toHaveTextContent('price_123')
  })

  test('renders correct pricing for subscribed user', async () => {
    mockCheckSubscription.mockResolvedValue(true)
    mockGetRemainSessions.mockResolvedValue(8)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should not show membership intro for subscribed users
    expect(screen.queryByText('Get discounted prices with')).not.toBeInTheDocument()

    // Should show discounted pricing (80% of original)
    const dropInRadio = screen.getByLabelText(/Drop-in.*\(20\$\)/)
    expect(dropInRadio).toBeChecked()

    // Full course should also show discounted price
    expect(screen.getByLabelText(/Full course - 8 sessions \(20% off\).*\(128\$\)/)).toBeInTheDocument()

    // Should use subscribed price ID
    expect(screen.getByTestId('stripe-price-id')).toHaveTextContent('price_sub_123')
  })

  test('switches between drop-in and full-course payment types', async () => {
    const user = userEvent.setup()
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(8)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Initially drop-in should be selected
    expect(screen.getByTestId('payment-type')).toHaveTextContent('ClassDropIn')

    // Click full-course radio button
    const fullCourseRadio = screen.getByLabelText(/Full course/)
    await user.click(fullCourseRadio)

    // Should switch to full course payment type
    await waitFor(() => {
      expect(screen.getByTestId('payment-type')).toHaveTextContent('ClassFullCourse')
      expect(screen.getByTestId('price')).toHaveTextContent('160')
      expect(screen.getByTestId('sessions')).toHaveTextContent('8')
    })
  })

  test('renders form link for legacy events', async () => {
    const formLinkProps = {
      ...defaultProps,
      formLink: 'https://forms.google.com/test-form',
    }

    render(<EventNormalCheckOut {...formLinkProps} />)

    // Should show reserve button initially
    expect(screen.getByText('Reserve')).toBeInTheDocument()
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument()

    // Click to show form
    fireEvent.click(screen.getByText('Reserve'))

    // Should show iframe with form
    await waitFor(() => {
      const iframe = document.querySelector('iframe')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', 'https://forms.google.com/test-form')
      expect(iframe).toHaveAttribute('width', '100%')
      expect(iframe).toHaveAttribute('height', '600')
    })
  })

  test('handles non-Class event types correctly', async () => {
    const concertProps = {
      ...defaultProps,
      type: 'Concert',
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(8)

    render(<EventNormalCheckOut {...concertProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should show "Buy Tickets" instead of "Drop-in" for non-Class events
    expect(screen.getByLabelText(/Buy Tickets.*\(25\$\)/)).toBeInTheDocument()
    
    // Should not show full course option for non-Class events
    expect(screen.queryByLabelText(/Full course/)).not.toBeInTheDocument()

    // Should use Concert as payment type
    expect(screen.getByTestId('payment-type')).toHaveTextContent('Concert')
  })

  test('calculates full course price correctly with discount', async () => {
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(10)

    const propsWithDiscount = {
      ...defaultProps,
      price: 30,
      fullCourseDiscount: 15, // 15% off
    }

    render(<EventNormalCheckOut {...propsWithDiscount} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Full course price should be: 30 * (100-15)/100 * 10 = 30 * 0.85 * 10 = 255
    expect(screen.getByLabelText(/Full course - 10 sessions \(15% off\).*\(255\$\)/)).toBeInTheDocument()
  })

  test('handles missing fullCourseDiscount gracefully', async () => {
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(5)

    const propsWithoutDiscount = {
      ...defaultProps,
      fullCourseDiscount: undefined,
    }

    render(<EventNormalCheckOut {...propsWithoutDiscount} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Without discount, full course price should be: 25 * 1 * 5 = 125
    expect(screen.getByLabelText(/Full course - 5 sessions.*\(125\$\)/)).toBeInTheDocument()
  })

  test('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCheckSubscription.mockRejectedValue(new Error('Subscription check failed'))
    mockGetRemainSessions.mockRejectedValue(new Error('Sessions fetch failed'))

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should log error but still render the component
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error checking subscription or sessions:',
      expect.any(Error)
    )

    // Component should still render with default values
    expect(screen.getByTestId('normal-checkout-button')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  test('renders without optional props', async () => {
    const minimalProps = {
      eventKeyName: 'test-event',
      userId: 'user_123',
      eventId: 'event_123',
      price: 25,
      email: 'test@example.com',
      type: 'Class',
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(5)

    render(<EventNormalCheckOut {...minimalProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should render without crashing
    expect(screen.getByTestId('normal-checkout-button')).toBeInTheDocument()
  })

  test('updates payment button when switching between payment types for subscribed user', async () => {
    const user = userEvent.setup()
    mockCheckSubscription.mockResolvedValue(true)
    mockGetRemainSessions.mockResolvedValue(6)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Initially should show drop-in with subscribed pricing
    expect(screen.getByTestId('payment-type')).toHaveTextContent('ClassDropIn')
    expect(screen.getByTestId('stripe-price-id')).toHaveTextContent('price_sub_123')

    // Switch to full course
    const fullCourseRadio = screen.getByLabelText(/Full course/)
    await user.click(fullCourseRadio)

    // Should update to full course with correct pricing
    await waitFor(() => {
      expect(screen.getByTestId('payment-type')).toHaveTextContent('ClassFullCourse')
      // Full course price for subscribed user: (25 * 0.8 * 6) * 0.8 = 96
      expect(screen.getByTestId('price')).toHaveTextContent('96')
      expect(screen.getByTestId('sessions')).toHaveTextContent('6')
    })
  })

  test('iframe shows and hides correctly for form link', async () => {
    const user = userEvent.setup()
    const formLinkProps = {
      ...defaultProps,
      formLink: 'https://forms.google.com/test-form',
    }

    render(<EventNormalCheckOut {...formLinkProps} />)

    // Initially should show button, no iframe
    expect(screen.getByText('Reserve')).toBeInTheDocument()
    expect(document.querySelector('iframe')).not.toBeInTheDocument()

    // Click reserve button
    await user.click(screen.getByText('Reserve'))

    // Should show iframe
    await waitFor(() => {
      const iframe = document.querySelector('iframe')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', 'https://forms.google.com/test-form')
      expect(iframe).toHaveClass('min-h-[600px]', 'w-full', 'rounded', 'border')
    })
  })

  test('displays correct pricing format for different scenarios', async () => {
    // Test with decimal prices
    const decimalProps = {
      ...defaultProps,
      price: 22.75,
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(4)

    render(<EventNormalCheckOut {...decimalProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should round pricing correctly: Math.round(22.75 * 100) / 100 = 22.75
    expect(screen.getByLabelText(/Drop-in.*\(22.75\$\)/)).toBeInTheDocument()
    
    // Full course: 22.75 * 0.8 * 4 = 72.8 (not rounded in the component)
    expect(screen.getByLabelText(/Full course.*\(72\.8\$\)/)).toBeInTheDocument()
  })

  test('calls API functions with correct parameters', async () => {
    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(mockCheckSubscription).toHaveBeenCalledWith('user_123')
      expect(mockGetRemainSessions).toHaveBeenCalledWith('event_123')
    })
  })

  test('handles zero remaining sessions', async () => {
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(0)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should show 0 sessions and 0 price for full course
    expect(screen.getByLabelText(/Full course - 0 sessions.*\(0\$\)/)).toBeInTheDocument()
  })

  test('renders membership link with correct href', async () => {
    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(5)

    render(<EventNormalCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const membershipLink = screen.getByText('membership')
    expect(membershipLink).toHaveAttribute('href', '/registration/membership')
    expect(membershipLink).toHaveClass('text-textColor-blue', 'hover:underline')
  })

  test('renders correctly for Concert type events', async () => {
    const concertProps = {
      ...defaultProps,
      type: 'Concert',
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(1)

    render(<EventNormalCheckOut {...concertProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should show "Buy Tickets" for Concert
    expect(screen.getByLabelText(/Buy Tickets.*\(25\$\)/)).toBeInTheDocument()
    
    // Should not show full course option for Concert
    expect(screen.queryByLabelText(/Full course/)).not.toBeInTheDocument()

    // Payment type should be Concert
    expect(screen.getByTestId('payment-type')).toHaveTextContent('Concert')
  })

  test('handles missing stripe IDs gracefully', async () => {
    const propsWithoutStripe = {
      ...defaultProps,
      stripePriceId: undefined,
      stripeProductId: undefined,
      stripeSubscribedPriceId: undefined,
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(5)

    render(<EventNormalCheckOut {...propsWithoutStripe} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Component should still render
    expect(screen.getByTestId('normal-checkout-button')).toBeInTheDocument()
  })

  test('applies correct discount calculation', async () => {
    const discountProps = {
      ...defaultProps,
      price: 100,
      fullCourseDiscount: 30, // 30% off
    }

    mockCheckSubscription.mockResolvedValue(false)
    mockGetRemainSessions.mockResolvedValue(5)

    render(<EventNormalCheckOut {...discountProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Full course price: 100 * (100-30)/100 * 5 = 100 * 0.7 * 5 = 350
    expect(screen.getByLabelText(/Full course - 5 sessions \(30% off\).*\(350\$\)/)).toBeInTheDocument()

    // Switch to full course and check price in checkout button
    const user = userEvent.setup()
    const fullCourseRadio = screen.getByLabelText(/Full course/)
    await user.click(fullCourseRadio)

    await waitFor(() => {
      expect(screen.getByTestId('price')).toHaveTextContent('350')
    })
  })

  test('handles concurrent API calls correctly', async () => {
    // Simulate slow API responses
    mockCheckSubscription.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 100))
    )
    mockGetRemainSessions.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(7), 150))
    )

    render(<EventNormalCheckOut {...defaultProps} />)

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Wait for both API calls to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 200 })

    // Should show results from both API calls
    expect(screen.getByLabelText(/Drop-in.*\(20\$\)/)).toBeInTheDocument() // subscribed pricing
    expect(screen.getByLabelText(/Full course - 7 sessions/)).toBeInTheDocument()
  })
})

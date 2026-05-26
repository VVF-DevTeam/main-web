import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import EventSingleCheckOut from './EventSingleCheckOut'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { EventTicket } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Mock dependencies
vi.mock('@/lib/actions/payment/checkSubscription')
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))
vi.mock('@/components/payment/NormalCheckoutButton', () => ({
  __esModule: true,
  default: ({
    buttonText,
    type,
    price,
    numberSession,
    stripePriceId,
    stripeProductId,
  }: {
    buttonText: string
    type: string
    price?: number
    numberSession?: number
    stripePriceId: string
    stripeProductId: string
  }) => (
    <div data-testid="normal-checkout-button">
      <span data-testid="button-text">{buttonText}</span>
      <span data-testid="payment-type">{type}</span>
      <span data-testid="price">{price}</span>
      <span data-testid="sessions">{numberSession ?? ''}</span>
      <span data-testid="stripe-price-id">{stripePriceId}</span>
      <span data-testid="stripe-product-id">{stripeProductId}</span>
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'reserve-button': 'Reserve',
        'payment-membershipIntro': 'Get discounted prices with',
        'payment-studentOnly-intro': 'Verify if you are a ',
        'payment-orVerifyStudentPrefix': ', or verify if you are a ',
        'payment-student-link': 'student',
        'payment-orVerifyStudentSuffix': '',
        'discount-code-cart-note-before': 'If you want to use a ',
        'discount-code-cart-note-code': 'discount code',
        'discount-code-cart-note-middle': ', please add the ticket to the cart and apply the code ',
        'discount-code-cart-note-below': 'below',
        'discount-code-cart-note-after': '.',
        sessions: 'sessions',
      }
      return translations[key] || key
    },
  }),
}))

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
const mockUseSession = vi.mocked(useSession)

const createTicket = (overrides: Partial<EventTicket> = {}): EventTicket =>
  ({
    id: 'ticket_default',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'General Admission',
    price: new Decimal(25),
    currency: 'CAD',
    discountMemberPercent: null,
    payTotalNumber: null,
    capacity: 100,
    sold: 0,
    validFrom: null,
    validTo: null,
    stripeProductId: 'prod_default',
    stripePriceId: 'price_default',
    subscribedStripePriceId: null,
    eventId: 'event_123',
    payments: [],
    ...overrides,
  }) as EventTicket

const classTickets: EventTicket[] = [
  createTicket({
    id: 'ticket_drop',
    type: 'Drop-in',
    stripeProductId: 'prod_drop',
    stripePriceId: 'price_drop',
    subscribedStripePriceId: 'price_drop_sub',
    discountMemberPercent: 20,
  }),
  createTicket({
    id: 'ticket_full',
    type: 'Full Event',
    stripeProductId: 'prod_full',
    stripePriceId: 'price_full',
    subscribedStripePriceId: 'price_full_sub',
    payTotalNumber: 8,
    discountMemberPercent: 20,
  }),
]

const defaultProps = {
  formLink: undefined,
  eventKeyName: 'test-event',
  userId: 'user_123',
  eventId: 'event_123',
  tickets: classTickets,
  email: 'test@example.com',
  type: 'Class',
}

describe('EventSingleCheckOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckSubscription.mockResolvedValue(false)
    mockUseSession.mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>)
  })

  test('renders loading state initially', () => {
    render(<EventSingleCheckOut {...defaultProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders ticket list for class events', async () => {
    render(<EventSingleCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Non–verified student: student verify line only (no membership mention)
    expect(
      screen.getByText('Verify if you are a ', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('membership')).not.toBeInTheDocument()
    expect(screen.getByText('student')).toBeInTheDocument()

    // Renders every ticket with a checkout button
    const checkoutButtons = screen.getAllByTestId('normal-checkout-button')
    expect(checkoutButtons).toHaveLength(classTickets.length)

    expect(screen.getByText(/Drop-in/i)).toBeInTheDocument()
    expect(screen.getByText(/Full Event/i)).toBeInTheDocument()
    expect(screen.getByText('CAD $200.00')).toBeInTheDocument()
  })

  test('uses subscribed pricing when user is subscribed', async () => {
    mockCheckSubscription.mockResolvedValue(true)

    render(<EventSingleCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(
      screen.queryByText('Get discounted prices with')
    ).not.toBeInTheDocument()

    const priceIds = screen
      .getAllByTestId('stripe-price-id')
      .map((node) => node.textContent)

    expect(priceIds).toContain('price_drop_sub')
    expect(priceIds).toContain('price_full_sub')
  })

  test('renders fallback when no tickets are available', async () => {
    render(
      <EventSingleCheckOut
        {...defaultProps}
        tickets={[]}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText('Tickets are currently unavailable. Please check back later.')
    ).toBeInTheDocument()
  })

  test('renders ticket for non-Class events with correct payment type', async () => {
    const concertTicket = [
      createTicket({
        id: 'concert_ticket',
        type: 'Front Row',
        stripeProductId: 'prod_concert',
        stripePriceId: 'price_concert',
      }),
    ]

    render(
      <EventSingleCheckOut
        {...defaultProps}
        type="Concert"
        tickets={concertTicket}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const paymentTypes = screen
      .getAllByTestId('payment-type')
      .map((node) => node.textContent)

    expect(paymentTypes).toContain('Concert')
  })

  test('renders form link for legacy events', async () => {
    const user = userEvent.setup()

    render(
      <EventSingleCheckOut
        {...defaultProps}
        formLink="https://forms.google.com/test-form"
      />
    )

    expect(screen.getByText('Reserve')).toBeInTheDocument()
    expect(document.querySelector('iframe')).not.toBeInTheDocument()

    await user.click(screen.getByText('Reserve'))

    await waitFor(() => {
      const iframe = document.querySelector('iframe')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', 'https://forms.google.com/test-form')
      expect(iframe).toHaveAttribute('width', '100%')
      expect(iframe).toHaveAttribute('height', '600')
    })
  })

  test('handles subscription errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCheckSubscription.mockRejectedValue(new Error('Subscription failed'))

    render(<EventSingleCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error checking subscription:',
      expect.any(Error)
    )

    expect(screen.getAllByTestId('normal-checkout-button')).toHaveLength(
      classTickets.length
    )

    consoleSpy.mockRestore()
  })

  test('student verify link points to /student when user is not a verified student', async () => {
    render(<EventSingleCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.queryByText('membership')).not.toBeInTheDocument()
    const studentLink = screen.getByText('student')
    expect(studentLink).toHaveAttribute('href', '/student')
    expect(studentLink).toHaveClass('text-textColor-blue', 'hover:underline')
  })

  test('membership link only when user has active student discount (no student verify link)', async () => {
    const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    mockUseSession.mockReturnValue({
      data: { user: { eduEmailExpiredDate: future } },
      status: 'authenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>)

    render(<EventSingleCheckOut {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const membershipLink = screen.getByText('membership')
    expect(membershipLink).toHaveAttribute('href', '/registration/membership')
    expect(membershipLink).toHaveClass('text-textColor-blue', 'hover:underline')

    expect(screen.queryByRole('link', { name: 'student' })).not.toBeInTheDocument()
  })
})

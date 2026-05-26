import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { Decimal } from '@prisma/client/runtime/library'
import { EventTicket } from '@prisma/client'
import type { ReactNode } from 'react'
import EventSingleCheckOut from './EventSingleCheckOut'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'

vi.mock('@/lib/actions/payment/checkSubscription')
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))
vi.mock('@/components/payment/SingleCheckoutButton', () => ({
  __esModule: true,
  default: ({
    buttonText,
    type,
  }: {
    buttonText: string
    type: string
  }) => (
    <div data-testid="single-checkout-button">
      <span>{buttonText}</span>
      <span>{type}</span>
    </div>
  ),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        or: 'or',
        'discount-code-cart-note-before': '',
        'discount-code-cart-note-code': '',
        'discount-code-cart-note-middle': '',
        'discount-code-cart-note-below': '',
        'discount-code-cart-note-after': '',
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
  }: {
    children: ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

const mockCheckSubscription = vi.mocked(checkSubscription)
const mockUseSession = vi.mocked(useSession)

const seatedTicket = {
  id: 'ticket_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  type: 'Front Row',
  price: new Decimal(75),
  currency: 'CAD',
  discountMemberPercent: null,
  payTotalNumber: null,
  capacity: 100,
  sold: 0,
  validFrom: null,
  validTo: null,
  stripeProductId: 'prod_front_row',
  stripePriceId: 'price_front_row',
  subscribedStripePriceId: null,
  eventId: 'event_1',
  payments: [],
} as EventTicket

describe('EventSingleCheckOut direct purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckSubscription.mockResolvedValue(false)
    mockUseSession.mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>)
  })

  test('shows the direct purchase control for active seated tickets', async () => {
    render(
      <EventSingleCheckOut
        eventKeyName="camp-registration"
        userId="user_1"
        eventId="event_1"
        tickets={[seatedTicket]}
        type="Concert"
        seatNumber="A1"
        userInfo={{
          id: 'user_1',
          name: 'Buyer',
          email: 'buyer@example.com',
          phone: '1234567890',
          phoneVerified: true,
          emailVerifiedDate: new Date(),
          role: ['USER'],
          password: null,
          subscribedAt: null,
          subscribeExpires: null,
          stripeSubscriptionId: null,
        }}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading tickets...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Seat Number: A1')).toBeInTheDocument()
    expect(screen.getByText('or:')).toBeInTheDocument()
    expect(screen.getByTestId('single-checkout-button')).toBeInTheDocument()
    expect(screen.getByText('purchase-ticket-directly')).toBeInTheDocument()
    expect(screen.getByText('Concert')).toBeInTheDocument()
  })
})

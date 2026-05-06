import { PaymentMethod, PaymentType } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

export type PaymentWithRelations = {
  id: string
  pricePaid: Decimal
  createdAt: Date
  type: PaymentType
  expiresAt: Date | null
  quantity: number
  refunded: boolean
  method: PaymentMethod
  stripePaymentId: string | null
  seatNumber: string | null
  guestName: string | null
  guestEmail: string | null
  user: {
    name: string | null
    email: string
  } | null
  monitorUser: {
    name: string | null
  } | null
  event: {
    title: string
    keyName: string
    startDate: Date | null
    endDate: Date
    location: string | null
  } | null
  eventTicket: {
    stripeProductId: string
  } | null
}

/**
 * Represents a single item in the checkout cart
 */
export type CheckoutItem = {
  /** Unique identifier for the event ticket */
  ticketId: string
  /** Stripe price ID (regular or member price) */
  stripePriceId: string
  /** Stripe product ID */
  stripeProductId: string
  /** Array of seat identifiers (empty for non-seated tickets) */
  seatNumbers: string[]
  /** Parent event id (`EventTicket.eventId`); must match the checkout request `eventId` */
  eventId: string
  /** Quantity for non-seated tickets (only when seatNumbers is empty) */
  quantity?: number
}

/**
 * Array of checkout items representing the shopping cart
 */
export type CheckoutItems = CheckoutItem[]
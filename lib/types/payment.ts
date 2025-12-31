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
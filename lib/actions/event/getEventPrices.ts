import { EventTicket } from '@prisma/client'

/**
 * Get formatted price display string for an event based on tickets or fallback price
 * @param tickets - Array of EventTicket objects (optional)
 * @param fallbackPrice - Fallback price to use if no tickets are available (optional)
 * @returns Formatted price string (e.g., "Free", "$150", "$150 - $200")
 */
export function getEventPrices(
  tickets?: EventTicket[] | null,
  fallbackPrice?: number | null
): string {
  // If tickets are available, use ticket-based pricing
  if (tickets && tickets.length > 0) {
    // Get base prices for all tickets (not considering payTotalNumber)
    const basePrices = tickets.map((ticket) => Number(ticket.price))

    const minPrice = Math.min(...basePrices)
    const maxPrice = Math.max(...basePrices)

    // If all prices are 0, show "Free"
    if (minPrice === 0 && maxPrice === 0) {
      return 'Free'
    }

    // If there's only one price or all prices are the same, show single price
    if (minPrice === maxPrice) {
      return `$${minPrice.toFixed(0)}`
    }

    // Show price range
    return `$${minPrice.toFixed(0)} - $${maxPrice.toFixed(0)}`
  }

  // Fallback to event.price if no tickets
  if (fallbackPrice !== undefined && fallbackPrice !== null) {
    return fallbackPrice === 0 ? 'Free' : `$${Number(fallbackPrice).toFixed(0)}`
  }

  // If no tickets and no fallback, return "Free"
  return 'Free'
}

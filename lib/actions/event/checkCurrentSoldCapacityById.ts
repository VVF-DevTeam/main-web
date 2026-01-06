'use server'

/**
 * Calculate total sold capacity for an event
 * Sum of (payment.quantity * ticket.capacityPerTicket) for all non-refunded payments
 * @param eventId - The ID of the event
 * @returns Total sold capacity (number)
 */
export async function checkCurrentSoldCapacityById(eventId: string): Promise<number> {
  const { prisma } = await import('@/lib/db')

  try {
    const soldPayments = await prisma.payment.findMany({
      where: {
        AND: [
          { eventId: eventId },
          { refunded: false },
        ],
      },
      include: {
        eventTicket: {
          select: {
            capacityPerTicket: true,
          },
        },
      },
    })

    const totalSoldCapacity = soldPayments.reduce((sum, payment) => {
      if (payment.eventTicket) {
        return sum + payment.quantity * payment.eventTicket.capacityPerTicket
      }
      return sum
    }, 0)

    return totalSoldCapacity
  } catch (error) {
    console.error('Error calculating sold capacity:', error)
    return -1
  }
}


"use server"
import { prisma } from "@/lib/db";

export async function getRemainSessions(eventId: string) {
  try {
    // Get event details from database
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        endDate: true,
        days: true,
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const today = new Date();
    const endDate = new Date(event.endDate);
    
    // If event has already ended
    if (endDate < today) {
      return 0;
    }

    // Get the days of the week as numbers (0-6, where 0 is Sunday)
    const eventDays = event.days.map((day: string) => {
      const dayMap: { [key: string]: number } = {
        'SUNDAY': 0,
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6
      };
      return dayMap[day];
    });
    let remainingSessions = 0;
    const currentDate = new Date(today);

    // Count remaining sessions until end date
    while (currentDate <= endDate) {
      if (eventDays.includes(currentDate.getDay())) {
        remainingSessions++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return remainingSessions;
  } catch (error) {
    console.error("Error calculating remaining sessions:", error);
    throw error;
  }
}

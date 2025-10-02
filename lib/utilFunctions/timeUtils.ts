/**
 * Utility functions for time conversion and range creation
 */

/**
 * Convert time string to minutes since midnight
 * @param time - Time string in format "H:MM AM/PM" (e.g., "9:00 AM")
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':').map(Number)
  let totalMinutes = hours * 60 + minutes
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60
  return totalMinutes
}

/**
 * Convert minutes since midnight to time string
 * @param minutes - Minutes since midnight
 * @returns Time string in format "H:MM AM/PM"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
}

/**
 * Create time ranges from consecutive time slots
 * @param slots - Array of time strings
 * @returns Array of time range strings
 */
export function createTimeRanges(slots: string[]): string[] {
  if (slots.length === 0) return []

  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a) - timeToMinutes(b)
  )
  const ranges: string[] = []
  let startTime = sortedSlots[0]
  let endTime = sortedSlots[0]

  for (let i = 1; i < sortedSlots.length; i++) {
    const currentTime = sortedSlots[i]
    const prevTime = sortedSlots[i - 1]

    // Check if current time is 1 hour after previous (consecutive)
    if (timeToMinutes(currentTime) === timeToMinutes(prevTime) + 60) {
      // Update end time to the end of current slot (currentTime + 1 hour)
      endTime = minutesToTime(timeToMinutes(currentTime) + 60)
    } else {
      // End current range and start new one
      const endOfStartSlot = minutesToTime(timeToMinutes(startTime) + 60)
      ranges.push(
        startTime === endTime
          ? `${startTime} - ${endOfStartSlot}`
          : `${startTime} - ${endTime}`
      )
      startTime = currentTime
      endTime = currentTime
    }
  }

  // Add the last range
  const endOfLastSlot = minutesToTime(timeToMinutes(startTime) + 60)
  ranges.push(
    startTime === endTime
      ? `${startTime} - ${endOfLastSlot}`
      : `${startTime} - ${endTime}`
  )
  return ranges
}
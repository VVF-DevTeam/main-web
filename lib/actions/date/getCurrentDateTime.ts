export function getCurrentDateTime() {
  const now = new Date()
  // Format date part: "Sunday, December 03, 2023"
  const datePart = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(now)

  // Format time part: "3:18 AM"
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now)

  // Combine into final format
  const finalFormatted = `${datePart} at ${timePart}`

  return finalFormatted
}

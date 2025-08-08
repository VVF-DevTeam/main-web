import { notFound } from 'next/navigation'

// This catch-all route handles any unmatched paths within a locale
// and triggers the locale-specific not-found page
export default function CatchAllPage() {
  notFound()
  
  // This return statement will never be reached because notFound() throws,
  // but it's required for TypeScript/React compliance
  return null
}
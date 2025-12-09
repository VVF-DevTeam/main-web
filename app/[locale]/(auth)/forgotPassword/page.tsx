import ForgotPasswordClient from '../_components/ForgotPasswordClient'

// No use of auth() or header or live database, so can be static
export const dynamic = 'force-static'

// Main Component
export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}

// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
interface EmailTemplateSubscriptionConfirmationProps {
  firstName: string
  pricePaid: number
  currency?: string
  subscriptionExpiresAt?: Date | null
}

interface SendSubscriptionConfirmationEmailProps {
  firstName: string
  to: string
  pricePaid: number
  currency?: string
  subscriptionExpiresAt?: Date | null
}

// Email Template Component
const EmailTemplateSubscriptionConfirmation = ({
  firstName,
  pricePaid,
  currency = 'CAD',
  subscriptionExpiresAt,
}: EmailTemplateSubscriptionConfirmationProps) => {
  const currencyLabel = currency.toUpperCase()
  const formattedPrice = pricePaid.toFixed(2)

  const expiryDateDisplay = subscriptionExpiresAt
    ? (() => {
        const expiryDate = new Date(subscriptionExpiresAt)
        return expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      })()
    : null

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: 'rgb(236,236,236)',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        {/* Logo Header */}
        <table cellPadding={0} cellSpacing={0} style={{ marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.vietvibe.org/logo/main-logo-1.png"
                  alt="Viet Vibe Foundation Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </td>
              <td style={{ verticalAlign: 'middle' }}>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#767676',
                  }}
                >
                  Viet Vibe Foundation
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <h1
          style={{ fontSize: '24px', marginBottom: '20px', color: '#111827' }}
        >
          Subscription Successful, {firstName}!
        </h1>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for subscribing! Your membership subscription has been
          successfully activated.
        </p>

        {/* Subscription Card */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            marginBottom: '20px',
          }}
        >
          <tbody>
            <tr>
              {/* Left: text content */}
              <td
                style={{
                  padding: '16px',
                  verticalAlign: 'top',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  Membership Subscription
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '12px',
                  }}
                >
                  {currencyLabel} {formattedPrice}
                </div>

                {expiryDateDisplay && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#111827',
                      marginBottom: '8px',
                    }}
                  >
                    Subscription Expires: {expiryDateDisplay}
                  </div>
                )}

                <p
                  style={{
                    fontSize: '11px',
                    color: '#111827',
                    marginBottom: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  Your membership benefits are now active! You can access all
                  member-exclusive events and content.
                </p>
                <p
                  style={{
                    fontSize: '9px',
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  *Note: There will be an email from Stripe with an invoice and
                  receipt attached for your payment. Please check your spam
                  folder if you don't see it in your inbox.
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
          If you have any questions, please contact us at{' '}
          <a href="mailto:tech@vietvibe.org" style={{ color: '#2563eb' }}>
            tech@vietvibe.org
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export async function sendSubscriptionConfirmationEmail({
  firstName,
  to,
  pricePaid,
  currency = 'CAD',
  subscriptionExpiresAt,
}: SendSubscriptionConfirmationEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)

  try {
    const result = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Subscription Successful - Your Membership Confirmation',
      react: EmailTemplateSubscriptionConfirmation({
        firstName,
        pricePaid,
        currency,
        subscriptionExpiresAt,
      }),
    })
    console.log('result sendSubscriptionConfirmationEmail', result)
    if (result.error) {
      console.error('[SUBSCRIPTION_CONFIRMATION_EMAIL_ERROR]', result.error)
      throw result.error
    }

    return result
  } catch (error) {
    console.error('[SUBSCRIPTION_CONFIRMATION_EMAIL_ERROR]', error)
    throw error
  }
}


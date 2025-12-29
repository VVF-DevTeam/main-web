// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
interface EmailTemplateRefundConfirmationProps {
  firstName: string
  ticketType: string
  refundedAmount: number
  currency?: string
  eventTitle?: string
  eventStartDate?: Date | null
  eventEndDate?: Date | null
  eventLocation?: string | null
}

interface SendRefundConfirmationEmailProps {
  firstName: string
  to: string
  ticketType: string
  refundedAmount: number
  currency?: string
  eventTitle?: string
  eventStartDate?: Date | null
  eventEndDate?: Date | null
  eventLocation?: string | null
}

// Email Template Component
const EmailTemplateRefundConfirmation = ({
  firstName,
  ticketType,
  refundedAmount,
  currency = 'CAD',
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventLocation,
}: EmailTemplateRefundConfirmationProps) => {
  const currencyLabel = currency.toUpperCase()
  const formattedRefund = refundedAmount.toFixed(2)

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f5f5f5',
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
        <h1
          style={{ fontSize: '24px', marginBottom: '20px', color: '#111827' }}
        >
          Refund Processed, {firstName}
        </h1>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Your refund for <strong>{ticketType}</strong> has been successfully
          processed. We are sorry to see you go and hope to see you again soon!
        </p>

        {eventTitle && (
          <p
            style={{
              fontSize: '16px',
              color: '#374151',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            Event: {eventTitle}
          </p>
        )}

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
                  {ticketType}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '12px',
                  }}
                >
                  {currencyLabel} ${formattedRefund} refunded
                </div>

                {eventStartDate &&
                  eventEndDate &&
                  (() => {
                    const startDate = new Date(eventStartDate)
                    const endDate = new Date(eventEndDate)
                    const startDateStr = startDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                    const endDateStr = endDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                    const isSameDate =
                      startDate.toDateString() === endDate.toDateString()
                    const dateDisplay = isSameDate
                      ? startDateStr
                      : `${startDateStr} - ${endDateStr}`

                    return (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#111827',
                          marginBottom: '8px',
                        }}
                      >
                        Original Event Date: {dateDisplay}
                      </div>
                    )
                  })()}

                {eventLocation && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#111827',
                      marginBottom: '8px',
                    }}
                  >
                    Event Location: {eventLocation}
                  </div>
                )}

                <p
                  style={{
                    fontSize: '10px',
                    color: '#111827',
                    marginBottom: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  *Note: Stripe will also send you a separate email with an
                  official refund receipt. Please check your spam folder if you
                  don't see it in your inbox.
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

export async function sendRefundConfirmationEmail({
  firstName,
  to,
  ticketType,
  refundedAmount,
  currency,
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventLocation,
}: SendRefundConfirmationEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)

  try {
    const result = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Refund Processed - Your Refund Confirmation',
      react: EmailTemplateRefundConfirmation({
        firstName,
        ticketType,
        refundedAmount,
        currency,
        eventTitle,
        eventStartDate,
        eventEndDate,
        eventLocation,
      }),
    })
    console.log('result sendRefundConfirmationEmail', result)
    if (result.error) {
      console.error('[REFUND_CONFIRMATION_EMAIL_ERROR]', result.error)
      throw result.error
    }

    return result
  } catch (error) {
    console.error('[REFUND_CONFIRMATION_EMAIL_ERROR]', error)
    throw error
  }
}



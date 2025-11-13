// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
interface EmailTemplatePaymentConfirmationProps {
  firstName: string
  ticketType: string
  pricePaid: number
  quantity: number
  currency?: string
  ticketImageUrl?: string | null
  perSessionPrice?: number
  payTotalNumber?: number | null
  eventTitle?: string
  seatNumber?: string
}

interface SendPaymentConfirmationEmailProps {
  firstName: string
  to: string
  ticketType: string
  pricePaid: number
  quantity: number
  currency?: string
  ticketImageUrl?: string | null
  perSessionPrice?: number
  payTotalNumber?: number | null
  eventTitle?: string
  seatNumber?: string
}

// Email Template Component
const EmailTemplatePaymentConfirmation = ({
  firstName,
  ticketType,
  pricePaid,
  quantity,
  currency = 'CAD',
  ticketImageUrl,
  perSessionPrice,
  payTotalNumber,
  eventTitle,
  seatNumber,
}: EmailTemplatePaymentConfirmationProps) => {
  const currencyLabel = currency.toUpperCase()
  const formattedPrice = pricePaid.toFixed(2)
  const formattedPerSessionPrice = perSessionPrice?.toFixed(2) || '0.00'

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#111827' }}>
          Payment Successful, {firstName}!
        </h1>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for your purchase. Your payment has been successfully processed.
        </p>
        
        {eventTitle && (
          <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px', fontWeight: 'bold' }}>
            Event: {eventTitle}
          </p>
        )}

        {/* Ticket Card */}
        <div
          style={{
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            padding: '0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Ticket Image - Full Width at Top */}
          {ticketImageUrl && (
            <div
              style={{
                width: '100%',
                maxHeight: '200px',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6',
              }}
            >
              <img
                src={ticketImageUrl}
                alt={`${ticketType} ticket`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                {ticketType}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                {currencyLabel} ${formattedPrice}
              </span>
            </div>
            {!seatNumber ? (
              <>
                {payTotalNumber && payTotalNumber > 0 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    Total for {payTotalNumber} sessions - ${currencyLabel} {formattedPerSessionPrice} each
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    ${currencyLabel} {formattedPerSessionPrice} per session
                  </span>
                )}
              </>
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Seat Number: {seatNumber}
              </span>
            )}
            {quantity > 1 && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Quantity: {quantity}
              </span>
            )}
          </div>
        </div>

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

export async function sendPaymentConfirmationEmail({
  firstName,
  to,
  ticketType,
  pricePaid,
  quantity,
  currency,
  ticketImageUrl,
  perSessionPrice,
  payTotalNumber,
  eventTitle,
  seatNumber,
}: SendPaymentConfirmationEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)
  
  try {
    const result = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Payment Successful - Your Ticket Confirmation',
      react: EmailTemplatePaymentConfirmation({
        firstName,
        ticketType,
        pricePaid,
        quantity,
        currency,
        ticketImageUrl,
        perSessionPrice,
        payTotalNumber,
        eventTitle,
        seatNumber,
      }),
    })

    if (result.error) {
      console.error('[PAYMENT_CONFIRMATION_EMAIL_ERROR]', result.error)
      throw result.error
    }

    return result
  } catch (error) {
    console.error('[PAYMENT_CONFIRMATION_EMAIL_ERROR]', error)
    throw error
  }
}


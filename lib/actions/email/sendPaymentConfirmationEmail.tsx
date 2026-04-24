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
  eventStartDate?: Date | null
  eventEndDate?: Date | null
  eventLocation?: string | null
  eventStartTime?: string | null
  eventEndTime?: string | null
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
  eventStartDate?: Date | null
  eventEndDate?: Date | null
  eventLocation?: string | null
  eventStartTime?: string | null
  eventEndTime?: string | null
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
  eventStartDate,
  eventEndDate,
  eventLocation,
  eventStartTime,
  eventEndTime,
}: EmailTemplatePaymentConfirmationProps) => {
  const currencyLabel = currency.toUpperCase()
  const formattedPrice = pricePaid.toFixed(2)
  const formattedPerSessionPrice = perSessionPrice?.toFixed(2) || '0.00'

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
          Payment Successful, {firstName}!
        </h1>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for your purchase! Your payment has been successfully
          processed.
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

        {/* Ticket Card */}
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
                  {currencyLabel} {formattedPrice}
                </div>

                {seatNumber ? (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px',
                    }}
                  >
                    Seat Number: {seatNumber}
                  </div>
                ) : payTotalNumber && payTotalNumber > 0 ? (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px',
                    }}
                  >
                    Total for {payTotalNumber} sessions – {currencyLabel}{' '}
                    {formattedPerSessionPrice} each
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px',
                    }}
                  >
                    {currencyLabel} {formattedPerSessionPrice} per session
                  </div>
                )}

                {quantity > 1 && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    Quantity: {quantity}
                  </div>
                )}
                {eventStartDate &&
                  eventEndDate &&
                  eventStartTime &&
                  eventEndTime &&
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

                    return (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#111827',
                          marginBottom: '8px',
                        }}
                      >
                        Event Time: {startDateStr} at {eventStartTime} - {endDateStr} at{' '}
                        {eventEndTime}
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
                    fontSize: '11px',
                    color: '#111827',
                    marginBottom: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  {' '}
                  Please arrive 15 minutes before the event starts so we can
                  check you in, thank you and see you soon!
                </p>
                <p
                  style={{
                    fontSize: '9px',
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  {' '}
                  *Note: There will be an email from Stripe with an invoice and
                  receipt attached for your payment. Please check your spam
                  folder if you don't see it in your inbox.
                </p>
              </td>

              {/* Right: image column */}
              {ticketImageUrl && (
                <td
                  width="40%"
                  style={{
                    backgroundColor: '#f3f4f6',
                    textAlign: 'right',
                    verticalAlign: 'middle',
                    padding: 0,
                  }}
                >
                  <a
                    href="https://www.vietvibe.org/en/events"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ticketImageUrl}
                      alt={`${ticketType} ticket`}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </a>
                </td>
              )}
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
  eventStartDate,
  eventEndDate,
  eventLocation,
  eventStartTime,
  eventEndTime,
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
        eventStartDate,
        eventEndDate,
        eventLocation,
        eventStartTime,
        eventEndTime,
      }),
    })
    console.log('result sendPaymentConfirmationEmail', result)
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

// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
export interface ShopOrderItem {
  title: string
  quantity: number
  unitPrice: number
  currency: string
  imageUrl?: string | null
}

interface EmailTemplateShopOrderConfirmationProps {
  firstName: string
  totalPricePaid: number
  currency?: string
  shopName?: string | null
  shopSlug?: string | null
  orderItems: ShopOrderItem[]
}

interface SendShopOrderConfirmationEmailProps {
  firstName: string
  to: string
  totalPricePaid: number
  currency?: string
  shopName?: string | null
  shopSlug?: string | null
  orderItems: ShopOrderItem[]
}

// Email Template Component
const EmailTemplateShopOrderConfirmation = ({
  firstName,
  totalPricePaid,
  currency = 'CAD',
  shopName,
  shopSlug,
  orderItems,
}: EmailTemplateShopOrderConfirmationProps) => {
  const currencyLabel = currency.toUpperCase()
  const formattedTotal = totalPricePaid.toFixed(2)
  const shopUrl = shopSlug
    ? `https://www.vietvibe.org/en/shop?shopSlug=${encodeURIComponent(shopSlug)}`
    : 'https://www.vietvibe.org/en/shop'

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
          Order Confirmed, {firstName}!
        </h1>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for your purchase! Your order has been successfully placed
          and payment processed.
        </p>

        {shopName && (
          <p
            style={{
              fontSize: '16px',
              color: '#374151',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            Shop:{' '}
            <a href={shopUrl} style={{ color: '#2563eb', textDecoration: 'none' }}>
              {shopName}
            </a>
          </p>
        )}

        {/* Order Items */}
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
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Item
              </th>
              <th
                style={{
                  padding: '10px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: '10px 16px',
                  textAlign: 'right',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr
                key={index}
                style={{ borderBottom: '1px solid #f3f4f6' }}
              >
                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#111827',
                        fontWeight: '500',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                >
                  {currencyLabel} {(item.unitPrice * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Total row */}
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td
                colSpan={2}
                style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Total
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                {currencyLabel} {formattedTotal}
              </td>
            </tr>
          </tbody>
        </table>

        <p
          style={{
            fontSize: '11px',
            color: '#111827',
            marginBottom: '8px',
            fontStyle: 'italic',
          }}
        >
          We will reach out to you regarding shipping or pick-up details for
          your order. Thank you and see you soon!
        </p>
        <p
          style={{
            fontSize: '9px',
            color: '#111827',
            marginBottom: '20px',
          }}
        >
          *Note: There will be an email from Stripe with an invoice and receipt
          attached for your payment. Please check your spam folder if you
          don&apos;t see it in your inbox.
        </p>

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

export async function sendShopOrderConfirmationEmail({
  firstName,
  to,
  totalPricePaid,
  currency = 'CAD',
  shopName,
  shopSlug,
  orderItems,
}: SendShopOrderConfirmationEmailProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)

  try {
    const result = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Order Confirmed - Your Shop Purchase',
      react: EmailTemplateShopOrderConfirmation({
        firstName,
        totalPricePaid,
        currency,
        shopName,
        shopSlug,
        orderItems,
      }),
    })
    console.log('result sendShopOrderConfirmationEmail', result)
    if (result.error) {
      console.error('[SHOP_ORDER_CONFIRMATION_EMAIL_ERROR]', result.error)
      throw result.error
    }

    return result
  } catch (error) {
    console.error('[SHOP_ORDER_CONFIRMATION_EMAIL_ERROR]', error)
    throw error
  }
}


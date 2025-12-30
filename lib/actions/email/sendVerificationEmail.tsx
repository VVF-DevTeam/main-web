// Libraries
import React from 'react'
import { CreateEmailResponse, Resend } from 'resend'

// Interfaces and Types
interface EmailTemplateAccountVerificationProps {
  firstName: string
  token: string
}

interface EmailTemplateProps {
  firstName: string
  token: string
  email: string
}

interface SendEmailTemplateProps {
  firstName: string
  to: string
  token: string
  type: string
}

// Main Components
const EmailTemplateAccountVerification = ({
  firstName,
  token,
}: EmailTemplateAccountVerificationProps) => {
  //const testlink = `http://localhost:3000/verifyAccount?token=${token}`
  const prodLink = `https://www.vietvibe.org/verifyAccount?token=${token}`
  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

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
          style={{ fontSize: '24px', marginBottom: '10px', color: '#111827' }}
        >
          Account Verification from Viet Vibe Foundation
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '20px',
          }}
        >
          Sent on {currentDateTime}
        </p>
        <h2
          style={{
            fontSize: '20px',
            marginBottom: '20px',
            color: '#111827',
          }}
        >
          Welcome, {firstName}!
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for signing up! Please verify your account to get started.
        </p>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <a
            href={prodLink}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#C11233',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Verify My Account
          </a>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
          Or copy and paste this link into your browser:
          <br />
          <span style={{ wordBreak: 'break-all', color: '#2563eb' }}>
            {prodLink}
          </span>
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
          If you have any questions, please contact us at{' '}
          <a href="mailto:tech@vietvibe.org" style={{ color: '#2563eb' }}>
            tech@vietvibe.org
          </a>{' '}
          or through our social media platforms.
        </p>
      </div>
    </div>
  )
}

const EmailTemplateForgotPassword = ({
  firstName,
  token,
  email,
}: EmailTemplateProps) => {
  const prodLink = `https://www.vietvibe.org/resetPassword?token=${token}&email=${email}`
  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

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
          style={{ fontSize: '24px', marginBottom: '10px', color: '#111827' }}
        >
          Forgot Password
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '20px',
          }}
        >
          Sent on {currentDateTime}
        </p>
        <h2
          style={{
            fontSize: '20px',
            marginBottom: '20px',
            color: '#111827',
          }}
        >
          Hi, {firstName}!
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          We received a request to reset your password. If you did not make this
          request, please ignore this email and change your password for
          security reasons.
        </p>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          This link will expire in 1 hour.
        </p>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <a
            href={prodLink}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#C11233',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Reset My Password
          </a>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
          Or copy and paste this link into your browser:
          <br />
          <span style={{ wordBreak: 'break-all', color: '#2563eb' }}>
            {prodLink}
          </span>
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
          If you have any questions, please contact us at{' '}
          <a href="mailto:tech@vietvibe.org" style={{ color: '#2563eb' }}>
            tech@vietvibe.org
          </a>{' '}
          or through our social media platforms.
        </p>
      </div>
    </div>
  )
}

export async function sendVerificationEmail({
  firstName,
  to,
  token,
  type,
}: SendEmailTemplateProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)
  let error: CreateEmailResponse | null = null
  if (type === 'accountVerification') {
    error = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Account verification',
      react: EmailTemplateAccountVerification({
        firstName: firstName,
        token: token,
      }),
    })
  } else if (type === 'forgotPassword') {
    error = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Forgot Password',
      react: EmailTemplateForgotPassword({
        firstName: firstName,
        token: token,
        email: to,
      }),
    })
  }

  console.log(error)
}

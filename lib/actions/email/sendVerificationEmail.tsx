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
const EmailTemplateAccountVerification = ({ firstName, token }: EmailTemplateAccountVerificationProps) => {
  //const testlink = `http://localhost:3000/verifyAccount?token=${token}`
  const prodLink = `https://www.vietvibe.org/verifyAccount?token=${token}`
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
      <p>
        <a href={prodLink}>Click</a> here to verify your account
      </p>
    </div>
  )
}

const EmailTemplateForgotPassword = ({ firstName, token, email }: EmailTemplateProps) => {
  const prodLink = `https://www.vietvibe.org/resetPassword?token=${token}&email=${email}`
  return (
    <div>
      <h1>Hi, {firstName}!</h1>
      <p> We received a request to reset your password. If you did not make this request, please ignore this email and change your password for security reasons.</p>
      <p>
        <a href={prodLink}>Click</a> here to reset your password. This link will expire in 1 hour.
      </p>
      <p>If you have any questions, please contact us at <a href="mailto:tech@vietvibe.org">tech@vietvibe.org</a>.</p>
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
      react: EmailTemplateAccountVerification({ firstName: firstName, token: token }),
    })
  } else if (type === 'forgotPassword') {
    error = await resend.emails.send({
      from: 'VVF Admin <admin.tech@vietvibe.org>',
      to: to,
      subject: 'Forgot Password',
      react: EmailTemplateForgotPassword({ firstName: firstName, token: token, email: to }),
    })
  }

  console.log(error)
}


// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types 
interface EmailTemplateProps {
  firstName: string
  token: string
}
interface SendEmailTemplateProps {
  firstName: string
  to: string
  token: string
}

// Main Components
const EmailTemplate = ({ firstName, token }: EmailTemplateProps) => {
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

export async function sendVerificationEmail({ firstName, to, token }: SendEmailTemplateProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)
  const { error } =  await resend.emails.send({
    from: 'VVF Admin <admin.tech@vietvibe.org>',
    to: to,
    subject: 'Account verification',
    react: EmailTemplate({ firstName: firstName, token: token }),
  })

  console.log(error)
}

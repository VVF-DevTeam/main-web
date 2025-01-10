"user server"
import React from 'react'
interface EmailTemplateProps {
  firstName: string
  token: string
}

export const EmailTemplate = ({ firstName, token }: EmailTemplateProps) => {
  const testlink = `http://localhost:3000/verifyAccount?token=${token}`
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
      <p>
        <a href={testlink}>Click</a> here to verify your account
      </p>
    </div>
  )
}

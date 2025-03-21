<<<<<<< HEAD

=======
>>>>>>> f5b91ba757f87f5f1282dd6b2a5a65609c989bbb
import React from 'react'
interface EmailTemplateProps {
  firstName: string
  token: string
}

export const EmailTemplate = ({ firstName, token }: EmailTemplateProps) => {
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

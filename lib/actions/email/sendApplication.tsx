// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
import { JobType } from '@prisma/client'

interface EmailTemplateProps {
  firstName: string
  lastName: string
  address: string
  city: string
  country: string
  postCode: string
  email: string
  phoneNumber: string
  keyName: string
}

interface SendEmailTemplateProps {
  firstName: string
  lastName: string
  address: string
  city: string
  country: string
  postCode: string
  email: string
  phoneNumber: string
  resume: File
  keyName: string
  jobType: JobType
}

const emailMapping: Record<JobType, string[]> = {
  Media: [
    'hoianh.nguyen@vietvibe.org',
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  Operations: [
    'eric.nguyen@vietvibe.org',
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  Event: [
    'cherry.nguyen@vietvibe.org',
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  HR: ['trong.nguyen@vietvibe.org', 'hr@vietvibe.org'],
  Tech: [
    'khaihung.luong@vietvibe.org',
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
}

// Main Components
const EmailTemplate = ({
  firstName,
  lastName,
  address,
  city,
  country,
  postCode,
  email,
  phoneNumber,
  keyName,
}: EmailTemplateProps) => {
  //const testlink = `http://localhost:3000/verifyAccount?token=${token}`
  return (
    <div>
      <h1>
        {firstName} {lastName}&rsquo;s Application for <strong>Position:</strong>{' '}
        <a href={`https://www.vietvibe.org/en/registration/jobs/${keyName}`}>
          {keyName}
        </a>
      </h1>
      <h3>Applicant Details</h3>
      <ul>
        <li>
          <strong>Name:</strong> {firstName} {lastName}
        </li>
        <li>
          <strong>Email:</strong> {email}
        </li>
        <li>
          <strong>Phone Number:</strong> {phoneNumber}
        </li>
        <li>
          <strong>Address:</strong> {address}, {city}, {postCode}, {country}
        </li>
      </ul>
    </div>
  )
}

export async function sendApplication({
  jobType,
  resume,
  ...data
}: SendEmailTemplateProps) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)
  const buffer = await resume.arrayBuffer()
  const base64Resume = Buffer.from(buffer).toString('base64')

  const { error } = await resend.emails.send({
    from: 'VVF Admin <admin.tech@vietvibe.org>',
    to: emailMapping[jobType],
    subject: `Application from ${data.firstName} ${data.lastName} for ${jobType}`,
    react: EmailTemplate(data),
    attachments: [
      {
        filename: resume.name,
        content: base64Resume,
      },
    ],
  })

  console.log(error)
}

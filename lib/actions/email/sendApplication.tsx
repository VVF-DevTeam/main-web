// Libraries
import React from 'react'
import { Resend } from 'resend'

// Interfaces and Types
import { JobType } from '@prisma/client'

// Utilities
import { createTimeRanges } from '@/lib/utilFunctions/timeUtils'

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
  teachHost?: string
  experience?: string
  availability?: Record<string, string[]>
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
  resume?: File
  keyName: string
  jobType: JobType
  teachHost?: string
  experience?: string
  availability?: Record<string, string[]>
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

function formatAvailabilityForEmail(
  availability?: Record<string, string[]>
): string | null {
  if (!availability || Object.keys(availability).length === 0) return null

  return Object.entries(availability)
    .filter(([, slots]) => slots.length > 0)
    .map(([date, slots]) => {
      const dateObj = new Date(date)
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      // Use the unified createTimeRanges function
      const ranges = createTimeRanges(slots)
      return `• ${dayName} (${formattedDate}): ${ranges.join(', ')}`
    })
    .join('\n')
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
  teachHost,
  experience,
  availability,
}: EmailTemplateProps) => {
  // Check if this is a host application
  const isHostApplication = teachHost !== undefined

  // Format availability for display using shared utility
  const availabilityText = formatAvailabilityForEmail(availability)

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return (
    <div>
      {isHostApplication ? (
        <h1>
          {firstName} {lastName}&apos;s Application for hosting {teachHost}
        </h1>
      ) : (
        <h1>
          {firstName} {lastName}&rsquo;s Application for{' '}
          <strong>Position:</strong>{' '}
          <a href={`https://www.vietvibe.org/en/registration/jobs/${keyName}`}>
            {keyName}
          </a>
        </h1>
      )}
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
        {isHostApplication && teachHost && (
          <li>
            <strong>What they want to teach/host:</strong> {teachHost}
          </li>
        )}
        {experience && (
          <li>
            <strong>Experience:</strong>
            <pre>{esc(experience)}</pre>
          </li>
        )}
        {availabilityText && (
          <li>
            <strong>Availability:</strong>
            <br />
            {availabilityText}
          </li>
        )}
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

  // Check if this is a host application
  const isHostApplication = data.teachHost !== undefined

  // Prepare email data
  const emailData: {
    from: string
    to: string[]
    subject: string
    react: React.ReactElement
    attachments?: Array<{
      filename: string
      content: string
    }>
  } = {
    from: 'VVF Admin <admin.tech@vietvibe.org>',
    to: emailMapping[jobType],
    subject: isHostApplication
      ? `Host Application from ${data.firstName} ${data.lastName}`
      : `Application from ${data.firstName} ${data.lastName} for ${jobType}`,
    react: EmailTemplate(data),
  }

  // Add resume attachment only for non-host applications
  if (!isHostApplication && resume) {
    const buffer = await resume.arrayBuffer()
    const base64Resume = Buffer.from(buffer).toString('base64')

    emailData.attachments = [
      {
        filename: resume.name,
        content: base64Resume,
      },
    ]
  }

  const { error } = await resend.emails.send(emailData)

  console.log(error)
}

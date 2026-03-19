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
  Marketing: [
    'hoianh.nguyen@vietvibe.org',
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  ProjectManager: [
    'trong.nguyen@vietvibe.org',
    'hoianh.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  Finance: [
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  HR: [
    'trong.nguyen@vietvibe.org',
    'khaihung.luong@vietvibe.org',
    'hoianh.nguyen@vietvibe.org',
    'hr@vietvibe.org',
  ],
  Tech: [
    'trong.nguyen@vietvibe.org',
    'khaihung.luong@vietvibe.org',
    'hr@vietvibe.org',
  ],
  Performance: [
    'trong.nguyen@vietvibe.org',
    'hr@vietvibe.org',
    'elena.trinh@vietvibe.org',
  ],
  Volunteer: [
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
    <div style={{ backgroundColor: 'rgb(236,236,236)', padding: '32px 0' }}>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '32px',
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

      {isHostApplication ? (
        <h1>
          {firstName} {lastName}&apos;s Application for hosting event:{' '}
          {teachHost}
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
            <div
              dangerouslySetInnerHTML={{
                __html: availabilityText.replace(/\n/g, '<br />'),
              }}
            />
          </li>
        )}
      </ul>
      </div>
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
      ? `Event Host Application from ${data.firstName} ${data.lastName}`
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

import { Resend } from 'resend'

interface SendEmailParams {
  recipients: string[]
  subject: string
  content: string
  attachments?: File[]
}

export async function sendEmail({
  recipients,
  subject,
  content,
  attachments,
}: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)

  // Convert attachments to base64
  const preparedAttachments = attachments
    ? await Promise.all(
        attachments.map(async (file) => {
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          return {
            filename: file.name,
            content: base64,
          }
        })
      )
    : undefined

  const { error } = await resend.emails.send({
    from: 'VVF Admin <admin.tech@vietvibe.org>',
    to: recipients,
    subject: subject,
    html: content, // ✅ Send Quill’s HTML directly
    attachments: preparedAttachments,
  })

  if (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

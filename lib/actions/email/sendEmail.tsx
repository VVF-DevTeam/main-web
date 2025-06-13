import { Resend } from 'resend'

interface SendEmailParams {
  recipients: string[]
  subject: string
  content: string
  attachments?: File[]
}

export function convertQuillToInlineEmailStyles(html: string): string {
  // Replace ql-align-* with inline text-align
  html = html
    .replace(
      /class="[^"]*\bql-align-center\b[^"]*"/g,
      'style="text-align: center;"'
    )
    .replace(
      /class="[^"]*\bql-align-right\b[^"]*"/g,
      'style="text-align: right;"'
    )
    .replace(
      /class="[^"]*\bql-align-justify\b[^"]*"/g,
      'style="text-align: justify;"'
    )

  // Replace ql-size-* with inline font-size
  html = html
    .replace(
      /class="[^"]*\bql-size-small\b[^"]*"/g,
      'style="font-size: 0.75em;"'
    )
    .replace(
      /class="[^"]*\bql-size-large\b[^"]*"/g,
      'style="font-size: 1.5em;"'
    )
    .replace(/class="[^"]*\bql-size-huge\b[^"]*"/g, 'style="font-size: 2.5em;"')

  // If span or p has multiple class names, strip just ql-* and preserve others if needed (optional)
  // Otherwise, remove leftover class attributes entirely
  html = html.replace(/\sclass="[^"]*"/g, '')

  return html
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
    // html: content,
    html: convertQuillToInlineEmailStyles(content),
    attachments: preparedAttachments,
  })

  if (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

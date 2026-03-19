import { Resend } from 'resend'

interface SendEmailParams {
  recipients: string[]
  subject: string
  content: string
  senderEmail: string
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
  senderEmail,
  attachments,
}: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY_PRODUCTION)

  // Determine sender email
  const fromEmail =
    senderEmail === 'default'
      ? 'VVF Admin <admin.tech@vietvibe.org>'
      : `VVF Admin <${senderEmail}>`

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

  const logoHeader = `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tbody>
        <tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <img
              src="https://www.vietvibe.org/logo/main-logo-1.png"
              alt="Viet Vibe Foundation Logo"
              style="width:24px;height:24px;object-fit:contain;display:block;"
            />
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:16px;font-weight:bold;color:#767676;">
              Viet Vibe Foundation
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  `

  const emailBody = `
    <div style="background-color:rgb(236,236,236);padding:32px 0;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:32px;">
        ${logoHeader}
        ${convertQuillToInlineEmailStyles(content)}
      </div>
    </div>
  `

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: subject,
    html: emailBody,
    attachments: preparedAttachments,
  })

  if (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

import { EmailTemplate } from '@/app/components/EmailTemplate'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
interface EmailTemplateProps {
  firstName: string
  to: string
  token: string
}
export async function sendEmail({ firstName, to, token }: EmailTemplateProps) {
  console.log("to:", to)
  console.log("token:",token)
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: to,
    subject: 'Account verification',
    react: EmailTemplate({ firstName: firstName, token: token }),
  })
}

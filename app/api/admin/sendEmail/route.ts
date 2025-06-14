import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/actions/email/sendEmail';

export const POST = async (request: Request) => {
  try {
    // Extract data from formData (attachments supported)
    const formData = await request.formData();

    const recipients = JSON.parse(formData.get('recipients') as string) as string[];
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const attachments: File[] = formData.getAll('attachments') as File[];
    // Call your actual sendEmail function
    await sendEmail({
      recipients,
      subject,
      content,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending email:', error);

    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

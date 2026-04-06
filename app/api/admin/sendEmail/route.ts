import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/actions/email/sendEmail';
// import { sendApplication } from '@/lib/actions/email/sendApplication';
// import { sendPaymentConfirmationEmail } from '@/lib/actions/email/sendPaymentConfirmationEmail';
// import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail';
// import { sendShopOrderConfirmationEmail } from '@/lib/actions/email/sendShopOrderConfirmationEmail';
// import { sendSubscriptionConfirmationEmail } from '@/lib/actions/email/sendSubscriptionConfirmationEmail';
// import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail';

export const POST = async (request: Request) => {
  try {
    // Extract data from formData (attachments supported)
    const formData = await request.formData();

    const recipients = JSON.parse(formData.get('recipients') as string) as string[];
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const senderEmail = formData.get('senderEmail') as string;
    const attachments: File[] = formData.getAll('attachments') as File[];
    // Call your actual sendEmail function
    await sendEmail({
      recipients,
      subject,
      content,
      senderEmail,
      attachments,
    });

    // to test, edit email field
    // // --- TEST: sendApplication ---
    // await sendApplication({
    //   jobType: 'Tech',
    //   firstName: 'John',
    //   lastName: 'Doe',
    //   address: '123 Main St',
    //   city: 'Montreal',
    //   country: 'Canada',
    //   postCode: 'H1A 1A1',
    //   email: 'john.doe@example.com',
    //   phoneNumber: '+1 514-000-0000',
    //   keyName: 'Frontend Developer',
    //   experience: '3 years of React and TypeScript experience.',
    // });

    // // --- TEST: sendPaymentConfirmationEmail ---
    // await sendPaymentConfirmationEmail({
    //   firstName: 'Jane',
    //   to: 'kazatashi1@gmail.com',
    //   ticketType: 'VIP Pass',
    //   pricePaid: 75.0,
    //   quantity: 2,
    //   currency: 'CAD',
    //   eventTitle: 'Viet Vibe Annual Gala',
    //   eventStartDate: new Date('2026-04-10T18:00:00'),
    //   eventEndDate: new Date('2026-04-10T22:00:00'),
    //   eventLocation: '1234 Festival Ave, Montreal, QC',
    //   eventStartTime: '6:00 PM',
    //   eventEndTime: '10:00 PM',
    // });

    // // --- TEST: sendRefundConfirmationEmail ---
    // await sendRefundConfirmationEmail({
    //   firstName: 'Jane',
    //   to: 'kazatashi1@gmail.com',
    //   ticketType: 'VIP Pass',
    //   refundedAmount: 75.0,
    //   currency: 'CAD',
    //   eventTitle: 'Viet Vibe Annual Gala',
    //   eventStartDate: new Date('2026-04-10T18:00:00'),
    //   eventEndDate: new Date('2026-04-10T22:00:00'),
    //   eventLocation: '1234 Festival Ave, Montreal, QC',
    // });

    // // --- TEST: sendShopOrderConfirmationEmail ---
    // await sendShopOrderConfirmationEmail({
    //   firstName: 'Alice',
    //   to: 'kazatashi1@gmail.com',
    //   totalPricePaid: 49.98,
    //   currency: 'CAD',
    //   shopName: 'VVF Merch Store',
    //   shopSlug: 'vvf-merch',
    //   orderItems: [
    //     { title: 'VVF T-Shirt (M)', quantity: 2, unitPrice: 24.99, currency: 'CAD' },
    //   ],
    // });

    // // --- TEST: sendSubscriptionConfirmationEmail ---
    // await sendSubscriptionConfirmationEmail({
    //   firstName: 'Bob',
    //   to: 'kazatashi1@gmail.com',
    //   pricePaid: 20.0,
    //   currency: 'CAD',
    //   subscriptionExpiresAt: new Date('2027-03-20T00:00:00'),
    // });

    // // --- TEST: sendVerificationEmail (account verification) ---
    // await sendVerificationEmail({
    //   firstName: 'Carol',
    //   to: 'kazatashi1@gmail.com',
    //   token: 'mock-verification-token-abc123',
    //   type: 'accountVerification',
    // });

    // // --- TEST: sendVerificationEmail (forgot password) ---
    // await sendVerificationEmail({
    //   firstName: 'Carol',
    //   to: 'kazatashi1@gmail.com',
    //   token: 'mock-reset-token-xyz789',
    //   type: 'forgotPassword',
    // });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending email:', error);

    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

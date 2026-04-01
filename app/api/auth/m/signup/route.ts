import { prisma } from '@/lib/db'
import { signUpSchema } from '@/lib/zodSchema/signupSchema'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/actions/token/tokenFunctions'
import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { linkGuestPaymentsToUser } from '@/lib/actions/payment/linkGuestPayments'
import initTranslation from '@/app/i18n'
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit'

interface SignupActionProps {
  firstName: string
  lastName: string
  email: string
  age: string
  phoneNumber: string
  address: string
  password: string
  confirmPassword: string
  locale?: string
}

export const POST = async (request: NextRequest) => {
  try {
    const signUpRequestData = (await request.json()) as SignupActionProps

    const parsedCredentials =
      await signUpSchema.safeParseAsync(signUpRequestData)

    if (parsedCredentials.error) {
      console.error(parsedCredentials.error.message)
      return NextResponse.json(
        { message: 'Something is not formatted' },
        { status: 400 }
      )
    }

    if (signUpRequestData.password !== signUpRequestData.confirmPassword)
      return NextResponse.json(
        {
          message: 'Password is not matched',
        },
        { status: 400 }
      )

    const clientIp = getClientIp(request.headers.get('x-forwarded-for'))
    const signupLimit = checkRateLimit({
      key: `m-signup:${clientIp}:${parsedCredentials.data.email.toLowerCase()}`,
      limit: 12,
      windowMs: 2 * 60 * 1000,
    })
    if (!signupLimit.allowed) {
      return NextResponse.json(
        {
          message: `Too many sign-up attempts. Try again in ${signupLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(signupLimit.retryAfterSeconds),
          },
        }
      )
    }

    const existedUser = await prisma.user.findUnique({
      where: {
        email: parsedCredentials.data.email,
      },
    })

    if (existedUser) {
      return NextResponse.json(
        { message: 'User is already existed' },
        { status: 409 }
      )
    }

    const existedPhonenumber = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        phone: parsedCredentials.data.phoneNumber,
      },
    })

    if (existedPhonenumber) {
      return NextResponse.json(
        {
          message: 'This phone number is already in used',
        },
        { status: 409 }
      )
    }

    const hashedPassword = bcrypt.hashSync(
      signUpRequestData.password,
      Number(process.env.BCRYPT_SALT)!
    )

    const fullName = `${signUpRequestData.firstName} ${signUpRequestData.lastName}`

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: signUpRequestData.email,
        age: String(signUpRequestData.age),
        phone: String(signUpRequestData.phoneNumber),
        address: signUpRequestData.address,
        password: hashedPassword,
      },
    })

    const verificationToken = await createToken(user.email)
    if (verificationToken && user) {
      await sendVerificationEmail({
        firstName: user.name!,
        to: user.email,
        token: verificationToken.token,
        type: 'accountVerification',
      })
    }

    // Revalidate users cache
    revalidateTag('users')

    // Link any guest payments made with this email to the new user account
    try {
      const linkResult = await linkGuestPaymentsToUser(user.id, user.email)
      if (linkResult.linkedCount > 0) {
        console.log(
          `[MOBILE_SIGNUP] Linked ${linkResult.linkedCount} guest payment(s) to new user account`
        )
      }
    } catch (linkError) {
      // Log error but don't fail signup if linking fails
      console.error('[MOBILE_SIGNUP] Failed to link guest payments:', linkError)
    }

    // Get translated message
    const locale = signUpRequestData.locale || 'en'
    const { t } = await initTranslation(locale, ['signIn-signUp'])

    return NextResponse.json(
      {
        message: t('account-created-success'),
      },
      { status: 201 }
    )
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

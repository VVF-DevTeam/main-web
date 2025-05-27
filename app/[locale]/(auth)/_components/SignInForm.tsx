'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

import { signinAction } from '@/lib/actions/auth/signinAction'
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CustomIcon from '@/app/[locale]/components/CustomIcon'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@radix-ui/react-separator'
import { signInSchema } from '@/lib/zodSchema/signinSchema'

import { redirect } from 'next/navigation'
import ProviderButtons from './ProviderButtons'
import { useSearchParams } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { useTranslation } from 'react-i18next'

// TODO: Fix bug that if email and password are prefilled, even if users click on other method to login like Github, it will login with email and password

const SignInForm = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const [showPassword, setShowPassword] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const searchParams = useSearchParams()
  const currentDateTime = getCurrentDateTime()

  useEffect(() => {
    // Retrieve the 'message' parameter from the URL query string
    const message = searchParams.get('message') || ''

    // Check if the message is 'sign-in-required'
    if (message === 'sign-in-required') {
      toast.info('Sign In Required', {
        description: (
          <div className="flex flex-col gap-1">
            <span>You need to sign in to access the requested page</span>
            <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
          </div>
        )
      })
    }
  }, [searchParams])

  useEffect(() => {
    // Redirect to home page if the user is already logged in
    if (!shouldRedirect) {
      return
    }
    redirect('/')
  }, [shouldRedirect])

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const response: ServerActionResponse = await signinAction(data)

      if (response.success) {
        toast.success(response.message, {
          description: (
            <span style={{ color: "var(--muted-foreground)" }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e' // green-500 color
          }
        })

        setShouldRedirect(true)
      } else {
        toast.error(response.message, {
          description: (
            <span style={{ color: "var(--muted-foreground)" }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', { 
        description: (
          <div className="flex flex-col gap-1">
            <span>{error instanceof Error ? error.message : 'Please try again later'}</span>
            <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    }
  }

  return (
    <div className="mt-8 flex w-full flex-col px-6 py-12 lg:px-14 xl:px-20">
      {/* Form Header */}
      <div className="flex-center header-font-black mb-24 gap-x-4 lg:mb-36">
        <CustomIcon height={100} width={100} />
        <h1 className="text-3xl">Viet Vibe Foundation</h1>
      </div>
      <h1 className="header-font-default text-4xl font-semibold text-textColor-brand">
        {t('login')}
      </h1>
      <p className="mt-8 text-base text-muted-foreground">
        {t('description-signIn')}
      </p>
      <Separator className="my-4 h-[1px] w-full bg-gray-300" />

      {/* Form */}
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="default-gap mt-4 flex flex-col pb-6"
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="header-font-default text-lg text-textColor-brand">
                    {t('email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="JoeSmith@gmail.com"
                      type="email"
                      {...field}
                      className="text-textColor lg:max-w-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="password"
                    className="header-font-default text-lg text-textColor-brand"
                  >
                    {t('password')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative lg:max-w-[360px]">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        {...field}
                        className="text-textColor lg:max-w-[360px]"
                      />
                      <Button
                        variant="ghost"
                        size={'icon'}
                        type="button"
                        aria-label="Toggle password visibility"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Eye className="h-7 w-7" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit & Other Actions */}
            <div className="flex-center mt-6 flex-col gap-y-4 self-stretch">
              <Button
                type="submit"
                className="w-full bg-bgColor-brand font-[600] text-textColor-white transition-all hover:scale-105 hover:bg-bgColor-brand/80"
              >
                {t('login')}
              </Button>
              {/* <p className="text-center text-sm font-bold">OR</p> */}
              <ProviderButtons />
              <p className="text-sm font-bold">OR</p>
              <p className="text-sm">
                {t('noAccount')}{' '}
                <Link
                  href="/signUp"
                  className="text-textColor-brand decoration-2 transition-all hover:text-textColor-brand/70 hover:underline"
                >
                  {t('signUp')}
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignInForm

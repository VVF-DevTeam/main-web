'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

import { signinAction } from '@/lib/actions/signinAction'
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
import { useToast } from '@/hooks/use-toast'
import { signInSchema } from '@/lib/zodSchema/signinSchema'

import { redirect } from 'next/navigation'
import ProviderButtons from './ProviderButtons'

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (shouldRedirect === false) {
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
      const response = await signinAction(data)

      if (response.success === "true") {
        toast({
          variant: 'default',
          title: 'Success',
          description: response.message,
        })

        setShouldRedirect(true)
      } else if (response.success === "false") {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message,
        })

      }
      else if (response.success === "pending") {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message,
        })
    }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    }
  }

  return (
    <div className="mt-8 flex w-full flex-col px-6 py-12 lg:px-14 xl:px-20">
      {/* form header */}
      <div className="mb-24 flex items-center gap-x-4 lg:mb-36">
        <CustomIcon height={100} width={100} />
        <h1 className="text-xl">Company Name</h1>
      </div>
      <h1 className="text-2xl font-semibold text-[#620BC4]">Login</h1>
      <p className="mt-8 text-sm text-muted-foreground">
        Login to your account to book event tickets or lessons.
      </p>
      <Separator className="my-4 h-[1px] w-full bg-gray-300" />
      {/* form */}
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 gap-y-8 pb-8 pt-2"
          >
            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="JoeSmith@gmail.com"
                      type="email"
                      {...field}
                      className="text-[#1B171A] lg:max-w-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password" className="text-[#620BC4]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative max-w-[360px]">
                      <Input
                        type={showPassword ? 'password' : 'text'}
                        placeholder="Enter your password"
                        {...field}
                        className="text-[#1B171A] lg:max-w-[360px]"
                      />
                      <Button
                        variant="ghost"
                        size={'icon'}
                        type="button"
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

            <div className="mt-6 flex flex-col gap-y-4 self-stretch">
              <Button
                type="submit"
                className="w-full bg-[#620BC4] font-[600] text-white transition-all hover:scale-105 hover:bg-[#620BC4]/80"
              >
                LogIn
              </Button>
              {/* <p className="text-center text-sm font-bold">OR</p> */}
              <ProviderButtons />
              <p className="text-center text-sm font-bold">OR</p>
              <p className="text-sm text-center">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signUp"
                  className="text-[#620BC4] decoration-2 transition-all hover:underline hover:opacity-80"
                >
                  Sign Up
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

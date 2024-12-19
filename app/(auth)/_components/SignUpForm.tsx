'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters long' }),
    lastName: z
      .string()
      .min(1, { message: 'Last name must be at least 2 characters long' }),
    email: z.string().email(),
    age: z.number().min(1),
    phoneNumber: z.number().min(10, { message: 'Incomplete phone number' }),
    address: z.string().min(10, { message: 'Incomplete address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 0,
      phoneNumber: 0,
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const response = await axios.post('/api/signup', data)
      console.log(response.data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
      console.log(error)
    }
  }
  return (
    <div className="flex h-full w-full flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-32">
      {/* form header */}
      <h1 className="mt-8 text-xl font-semibold text-[#620BC4] md:text-3xl lg:mt-12">
        Register
      </h1>
      <p className="mt-6 text-sm text-muted-foreground">
        Let us get you all set up.
      </p>
      <Separator className="my-4 h-[1px] w-full bg-gray-300" />
      {/* form */}
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-4 grid grid-cols-1 gap-x-6 gap-y-6 pt-2 md:grid-cols-2 md:gap-y-8 lg:gap-x-8"
          >
            {/* first name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: Joe"
                      {...field}
                      className="border-2 text-[#1B171A] lg:max-w-[360px]"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {/* last name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: Smith"
                      {...field}
                      className="text-[#1B171A] lg:max-w-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {/* age */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">Age</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: 26"
                      {...field}
                      className="text-[#1B171A] lg:max-w-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* phone number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">Phone No</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: 1234567890"
                      {...field}
                      className="text-[#1B171A] lg:max-w-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#620BC4]">Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: 123 Main St"
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
                    <div className="relative">
                      <Input
                        type={!showPassword ? 'password' : 'text'}
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
            {/* confirm password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="confirmPassword"
                    className="text-[#620BC4]"
                  >
                    confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={!showPassword ? 'password' : 'text'}
                        placeholder="Confirm password"
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
                className="max-w-60 bg-[#620BC4] font-[600] text-white transition-all hover:scale-105 hover:bg-[#620BC4]/80"
              >
                Create Account
              </Button>
              <p className="text-sm">
                Already have an account?{' '}
                <Link
                  href="/signIn"
                  className="text-[#620BC4] decoration-2 transition-all hover:underline hover:opacity-80"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignUpForm

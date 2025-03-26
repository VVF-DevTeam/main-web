'use client'
// Libraries
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'
import { useToast } from '@/hooks/use-toast'

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Interfaces and Types
import { createApplicationSchema } from '@/lib/zodSchema/createApplicationSchema'
import { JobType } from '@prisma/client'

interface ApplicationProps {
  author: string
  id: string
  keyName: string
  jobType: JobType
}

// Main Component
const ApplicationForm = ({
  author,
  id,
  keyName,
  jobType,
}: ApplicationProps) => {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createApplicationSchema>>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      postCode: '',
      email: '',
      phoneNumber: '',
      resume: undefined,
    },
  })

  const onSubmit = async (data: z.infer<typeof createApplicationSchema>) => {
    try {
      const jobData = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        city: data.city,
        country: data.country,
        postCode: data.postCode,
        email: data.email,
        phoneNumber: data.phoneNumber,
        resume: data.resume,
      }
      const response = await axios.post(
        `/api/jobs/apply/${id}`,
        { ...jobData, userId: author, jobType: jobType, keyName: keyName },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      if (response.status === 200) {
        toast({
          variant: 'default',
          title: 'Success',
          description:
            'Job applied successfully. Thank you for your application! Please wait for our response, we will get back to you soon.',
        })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Duplicate Application',
            description:
              'You have already applied for this job, if you want to add new information, please send an email to the admin',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Error making request to database',
            description:
              error.response?.data ||
              'Something went wrong. Please contact the admin',
          })
        }
      } else if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error?.message || 'Something went wrong. Please contact the admin.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please contact the admin.',
        })
      }
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col-default grid-all-cols-2"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Liam"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Brown"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: 123 Main St"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Vancouver"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Canada"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">
                  Postal Code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: V5R 2E6"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: liam.brown@gmail.com"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: 778-788-7788"
                    className="text-textColor md:max-w-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="resume"
            render={() => (
              <FormItem>
                <FormLabel className="text-textColor-brand">Resume</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    className="text-textColor md:max-w-[300px]"
                    onChange={(e) => {
                      if (e.target.files) {
                        form.setValue('resume', e.target.files[0] as File)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="col-span-2 max-w-32 bg-bgColor-brand text-textColor-white hover:bg-bgColor-brandLight"
          >
            Apply
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ApplicationForm

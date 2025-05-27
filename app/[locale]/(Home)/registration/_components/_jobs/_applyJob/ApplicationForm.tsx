'use client'
// Libraries
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

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

  const currentDateTime = getCurrentDateTime()

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
        toast.success('Job applied successfully. Thank you for your application! Please wait for our response, we will get back to you soon.')
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Duplicate Application', {
            description: (
              <div className="flex flex-col gap-1">
                <span>You have already applied for this job, if you want to add new information, please send an email to the admin</span>
                <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
              </div>
            ),
            style: {
              color: '#ef4444' // red-500 color
            }
          })
        } else {
          toast.error('Error making request to database', {
            description: (
              <div className="flex flex-col gap-1">
                <span>{error.response?.data || 'Something went wrong. Please contact the admin'}</span>
                <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
              </div>
            ),
            style: {
              color: '#ef4444' // red-500 color
            }
          })
        }
      } else if (error instanceof Error) {
        toast.error(error?.message || 'Something went wrong. Please contact the admin.', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
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

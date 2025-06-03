'use client'

import dynamic from 'next/dynamic'
import React, { useMemo, useState } from 'react'
import { FiPaperclip, FiX } from 'react-icons/fi'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import 'react-quill/dist/quill.snow.css'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import EmailSuggestion from './EmailSuggestion'

interface Event {
  id: string
  title: string
}

interface EventParticipants {
  userId: string
  eventId: string | null
  user: {
    email: string
    name: string | null
  } | null
}

const sendEmailSchema = z.object({
  event: z.string(),
  recipients: z
    .array(z.string().email({ message: 'Please enter a valid email' }))
    .min(1, 'At least one recipient required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  attachments: z.array(z.instanceof(File)).optional(),
})

type SendEmailFormValues = z.infer<typeof sendEmailSchema>

const EmailComposition = ({
  events,
  eventParticipants,
}: {
  events: Event[]
  eventParticipants: EventParticipants[]
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill-new'), { ssr: false }),
    []
  )

  const form = useForm<SendEmailFormValues>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      event: '',
      recipients: [],
      subject: '',
      content: '',
      attachments: [],
    },
  })

  const [selectedEvent, setSelectedEvent] = useState('')
  const [loading, setLoading] = useState(false)

  const modules = {
    toolbar: [
      [{ font: [] }],
      ['bold', 'italic', 'underline'],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['link'],
    ],
  }

  const onSubmit = async (data: SendEmailFormValues) => {
    const currentDateTime = new Date().toLocaleString()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('recipients', JSON.stringify(data.recipients))
      formData.append('subject', data.subject)
      formData.append('content', data.content)
      data.attachments?.forEach((file) => formData.append('attachments', file))

      const response = await axios.post('/api/admin/sendEmail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.status === 200) {
        toast.success(t('email-sent-successfully'), {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' }, // green-500
        })
        form.reset()
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data ||
            'Something went wrong. Please contact the admin.'
          : error instanceof Error
            ? error.message || 'Something went wrong. Please contact the admin.'
            : 'Something went wrong. Please contact the admin.'

      toast.error('Failed to send email', {
        description: (
          <div className="flex flex-col gap-1">
            <span>{errorMessage}</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: { color: '#ef4444' }, // red-500
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('email-composition')}</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-6">
            {/* Select Event */}
            <FormField
              control={form.control}
              name="event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('select-an-event')}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedEvent(value)
                      form.setValue('recipients', [])
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select-an-event')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipients */}
            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <EmailSuggestion
                  field={field}
                  emails={eventParticipants
                    .filter((p) => p.eventId === selectedEvent && p.user?.email)
                    .map((p) => ({
                      email: p.user!.email,
                      name: p.user?.name ?? null,
                    }))}
                />
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Subject')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={100}
                      placeholder={t('Subject') ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content (ReactQuill) */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email-content')}</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      className="h-fit w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments */}
            <FormField
              control={form.control}
              name="attachments"
              render={() => (
                <FormItem>
                  <FormLabel>{t('Attachments')}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">
                        <FiPaperclip className="mr-2 inline-block" />
                        {t('Add-file')}
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files
                              ? Array.from(e.target.files).filter(
                                  (f) => f.size <= 5000000
                                )
                              : []
                            form.setValue('attachments', [
                              ...(form.getValues().attachments || []),
                              ...files,
                            ])
                          }}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                        />
                      </label>
                    </div>
                  </FormControl>

                  <div className="mt-2 space-y-2">
                    {(form.watch('attachments') || []).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-gray-50 p-2"
                      >
                        <span className="text-sm text-gray-600">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const files = form.getValues('attachments') || []
                            files.splice(index, 1)
                            form.setValue('attachments', [...files])
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className={loading ? 'bg-bgColor-brand' : ''}
              >
                {loading ? t('email-sending') : t('email-send')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default EmailComposition

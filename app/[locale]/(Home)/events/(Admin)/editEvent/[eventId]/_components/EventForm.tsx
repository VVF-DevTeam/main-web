'use client'

import React, { useEffect } from 'react'
import { Event } from '@prisma/client'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axios'

interface EventFormProps {
  event: Event
}

/**
 * Shape of a single dynamic question that will be stored in EventForm.FormData (Json)
 *
 * Example stored JSON:
 * [
 *   {
 *     "id": "q1",
 *     "question": "What is your full name?",
 *     "type": "short_text",
 *     "required": true
 *   },
 *   {
 *     "id": "q2",
 *     "question": "What class are you interested in?",
 *     "type": "single_choice",
 *     "required": true,
 *     "options": ["Beginner", "Intermediate", "Advanced"]
 *   }
 * ]
 */

const QuestionSchema = z.object({
  id: z.string().optional(), // can be generated on backend
  question: z.string().min(1, 'Question is required'),
  description: z.string().optional(),
  type: z.enum([
    'short_text',
    'long_text',
    'number',
    'single_choice',
    'multi_choice',
    'date',
  ]),
  required: z.boolean().default(false),
  options: z
    .array(z.string().min(1))
    .optional()
    .transform((opts) => (opts && opts.length ? opts : undefined)),
})

const EventDynamicFormSchema = z.object({
  questions: z.array(QuestionSchema),
})

type EventDynamicFormValues = z.infer<typeof EventDynamicFormSchema>

type QuestionType = z.infer<typeof QuestionSchema>['type']

const EMPTY_QUESTION: z.infer<typeof QuestionSchema> = {
  question: '',
  description: '',
  type: 'short_text',
  required: true,
  options: undefined,
}

const EventForm = ({ event }: EventFormProps) => {
  const form = useForm<EventDynamicFormValues>({
    resolver: zodResolver(EventDynamicFormSchema),
    defaultValues: {
      questions: [EMPTY_QUESTION],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  })

  // Load existing form definition (if any)
  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/events/forms/${event.id}`
        )
        const data = response.data?.data

        if (data && Array.isArray(data.questions)) {
          form.reset({
            questions: data.questions.length
              ? data.questions
              : [EMPTY_QUESTION],
          })
        }
      } catch (error) {
        console.error('Failed to load event form definition', error)
      }
    }

    fetchFormDefinition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id])

  const onSubmit = async (values: EventDynamicFormValues) => {
    try {
      // If no questions left, clear the form definition on the backend
      if (!values.questions || values.questions.length === 0) {
        await axiosInstance.put(`/api/events/forms/${event.id}`, {
          formData: null,
        })

        toast.success('Event registration form cleared.', {
          description: 'All custom questions have been removed for this event.',
          style: {
            color: '#22c55e', // green-500 color
          },
        })
        return
      }

      await axiosInstance.put(`/api/events/forms/${event.id}`, {
        formData: values,
      })

      toast.success('Event registration form definition saved.', {
        description:
          'Your questions and expected answer formats have been updated.',
        style: {
          color: '#22c55e', // green-500 color
        },
      })
    } catch (error) {
      console.error(error)
      toast.error('Unable to save event registration form. Please try again.')
    }
  }

  const handleAddQuestion = () => {
    append(EMPTY_QUESTION)
  }

  const isChoiceType = (type: QuestionType) =>
    type === 'single_choice' || type === 'multi_choice'

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Custom Registration Questions</h3>
          <p className="text-sm text-muted-foreground">
            Design the questions participants must answer when registering for
            this event.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => {
              const fieldType = form.watch(`questions.${index}.type`)

              return (
                <div
                  key={field.id}
                  className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Question {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`questions.${index}.question`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. What is your full name?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Helper text (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={2}
                              placeholder="Add any additional instructions or context for this question."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected answer format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select answer format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short_text">
                                Short text
                              </SelectItem>
                              <SelectItem value="long_text">
                                Long text
                              </SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="single_choice">
                                Single choice (radio)
                              </SelectItem>
                              <SelectItem value="multi_choice">
                                Multiple choice (checkboxes)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                          <div className="space-y-0.5">
                            <FormLabel>Required</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Participants must answer this question.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-bgColor-brand900"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {isChoiceType(fieldType) && (
                    <FormField
                      control={form.control}
                      name={`questions.${index}.options`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Options</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Enter one option per line, e.g.&#10;Beginner&#10;Intermediate&#10;Advanced"
                              onChange={(e) => {
                                const lines = e.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                field.onChange(lines)
                              }}
                              value={(field.value || []).join('\n')}
                            />
                          </FormControl>
                          <p className="mt-1 text-xs text-muted-foreground">
                            These options will be shown as{' '}
                            {fieldType === 'single_choice'
                              ? 'radio buttons.'
                              : 'checkboxes.'}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuestion}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add another question
            </Button>

            <Button type="submit" variant="default">
              Save form definition
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EventForm

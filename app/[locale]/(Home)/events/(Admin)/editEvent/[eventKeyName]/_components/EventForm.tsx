'use client'

import React, { useEffect, useState } from 'react'
import { Event } from '@prisma/client'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'

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
import Loader from '@/components/loader/Loader'
import { getEventForm } from '@/lib/actions/event/getEventForm'

interface EventFormProps {
  event: Event
}

/**
 * Shape of a single dynamic question that will be stored in EventForm.FormData (Json)
 *
 * Example stored JSON:
 * {
 *   "questions": [
 *     {
 *       "id": "V1StGXR8_Z", // Auto-generated with nanoid(10)
 *       "question": "What is your full name?",
 *       "type": "short_text",
 *       "required": true
 *     },
 *     {
 *       "id": "4f90d13a42", // Auto-generated with nanoid(10)
 *       "question": "What class are you interested in?",
 *       "type": "single_choice",
 *       "required": true,
 *       "options": ["Beginner", "Intermediate", "Advanced"]
 *     }
 *   ]
 * }
 */

const QuestionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'), // Required - generated with nanoid
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

const createEmptyQuestion = (): z.infer<typeof QuestionSchema> => ({
  id: nanoid(), // Generate unique 21-character ID
  question: '',
  description: '',
  type: 'short_text',
  required: true,
  options: undefined,
})

interface OptionsFieldArrayProps {
  control: any
  questionIndex: number
  fieldType: QuestionType
  isLoading: boolean
}

const OptionsFieldArray = ({
  control,
  questionIndex,
  fieldType,
  isLoading,
}: OptionsFieldArrayProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  })

  // Ensure at least one option box exists
  useEffect(() => {
    if (fields.length === 0) {
      append('')
    }
  }, [fields.length, append])

  return (
    <FormField
      control={control}
      name={`questions.${questionIndex}.options`}
      render={() => (
        <FormItem className="mt-4">
          <FormLabel>Options</FormLabel>
          <div className="space-y-2">
            {fields.map((field, optionIndex) => (
              <div
                key={field.id}
                className="flex items-center gap-2"
              >
                <FormField
                  control={control}
                  name={`questions.${questionIndex}.options.${optionIndex}`}
                  render={({ field: optionField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...optionField}
                          placeholder={`Option ${optionIndex + 1}`}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    disabled={isLoading}
                    onClick={() => remove(optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append('')}
              disabled={isLoading}
              className="mt-2 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add option
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            These options will be shown as{' '}
            {fieldType === 'single_choice'
              ? 'radio buttons.'
              : 'checkboxes.'}
          </p>
        </FormItem>
      )}
    />
  )
}

const EventForm = ({ event }: EventFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<EventDynamicFormValues>({
    resolver: zodResolver(EventDynamicFormSchema),
    defaultValues: {
      questions: [createEmptyQuestion()],
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
        const data = await getEventForm(event.id)

        if (data && Array.isArray(data.questions)) {
          // Ensure options are initialized as arrays for choice type questions
          // and generate IDs for questions that don't have them (backward compatibility)
          const normalizedQuestions = data.questions.map((q: any) => ({
            ...q,
            id: q.id || nanoid(10), // Generate ID if missing (for old data)
            options: q.options && Array.isArray(q.options) ? q.options : undefined,
          }))
          form.reset({
            questions: normalizedQuestions.length
              ? normalizedQuestions
              : [createEmptyQuestion()],
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
      setIsLoading(true)
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

      // Filter out empty options from choice type questions
      const cleanedValues = {
        ...values,
        questions: values.questions.map((q) => ({
          ...q,
          options: q.options
            ? q.options.filter((opt) => opt.trim().length > 0)
            : undefined,
        })),
      }

      await axiosInstance.put(`/api/events/forms/${event.id}`, {
        formData: cleanedValues,
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestion = () => {
    append(createEmptyQuestion())
  }

  const isChoiceType = (type: QuestionType) =>
    type === 'single_choice' || type === 'multi_choice'

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Custom Registration Questions</h3>
          <p className="text-sm text-muted-foreground">
            Design the questions participants must answer when registering for
            this event. Note that this form will be displayed after clicking purchase button, and will be shown after users fill in their information.
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
                      disabled={isLoading}
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
                              placeholder="e.g. Is there anything else you would like to add?"
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
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Initialize options array when switching to choice type
                              if (value === 'single_choice' || value === 'multi_choice') {
                                const currentOptions = form.getValues(`questions.${index}.options`)
                                if (!currentOptions || !Array.isArray(currentOptions) || currentOptions.length === 0) {
                                  form.setValue(`questions.${index}.options`, [''])
                                }
                              } else {
                                // Clear options when switching away from choice type
                                form.setValue(`questions.${index}.options`, undefined)
                              }
                            }}
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
                    <OptionsFieldArray
                      control={form.control}
                      questionIndex={index}
                      fieldType={fieldType}
                      isLoading={isLoading}
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
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add another question
            </Button>

            <Button type="submit" variant="default" disabled={isLoading}>
              Save form definition
            </Button>
          </div>
        </form>
      </Form>
    </div>
    </>
  )
}

export default EventForm

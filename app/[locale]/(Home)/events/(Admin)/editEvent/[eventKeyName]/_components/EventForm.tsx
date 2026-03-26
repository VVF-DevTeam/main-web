'use client'

import React, { useEffect, useState } from 'react'
import { Event } from '@prisma/client'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'
import { getEventForm } from '@/lib/actions/event/getEventForm'

interface EventFormProps {
  event: Event
}

/**
 * Final data format saved to EventForm.FormData (JSON):
 * [
 *   {
 *     "questions": [
 *       { "id": "V1StGXR8_Z", "question": "Full name?", "type": "short_text", "required": true, "formNumber": 0 },
 *       { "id": "4f90d13a42", "question": "Class?", "type": "single_choice", "required": true, "options": ["Beginner", "Advanced"], "formNumber": 1 }
 *     ]
 *   },
 *   {
 *     "questions": [...]
 *   }
 * ]
 */

const LINKABLE_TYPES = ['number', 'single_choice', 'multi_choice'] as const
const CUSTOM_INPUT_TOKEN = ':$customInput$'

const QuestionConditionSchema = z.object({
  numberOperator: z.enum(['eq', 'lt', 'gt']).optional(),
  numberValue: z.number().optional(),
  selectedChoices: z.array(z.string()).optional(),
  matchMode: z.enum(['any', 'all']).optional(),
})

const QuestionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
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
  linkedQuestionId: z.string().optional(),
  condition: QuestionConditionSchema.optional(),
  formNumber: z.number().int().min(0).optional(),
})

type LinkableQuestion = {
  id: string
  question: string
  type: QuestionType
  options?: string[]
}

const SingleFormSchema = z.object({
  questions: z.array(QuestionSchema),
})

const EventFormsSchema = z.object({
  forms: z.array(SingleFormSchema),
})

type EventFormsValues = z.infer<typeof EventFormsSchema>
type QuestionType = z.infer<typeof QuestionSchema>['type']

const createEmptyQuestion = (): z.infer<typeof QuestionSchema> => ({
  id: nanoid(),
  question: '',
  description: '',
  type: 'short_text',
  required: true,
  options: undefined,
  linkedQuestionId: undefined,
  condition: undefined,
})

const createEmptyForm = () => ({
  questions: [createEmptyQuestion()],
})

// ---------------------------------------------------------------------------
// OptionsFieldArray
// ---------------------------------------------------------------------------
interface OptionsFieldArrayProps {
  control: any
  formIndex: number
  questionIndex: number
  fieldType: QuestionType
  isLoading: boolean
}

const OptionsFieldArray = ({
  control,
  formIndex,
  questionIndex,
  fieldType,
  isLoading,
}: OptionsFieldArrayProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `forms.${formIndex}.questions.${questionIndex}.options`,
  })

  useEffect(() => {
    if (fields.length === 0) {
      append('')
    }
  }, [fields.length, append])

  return (
    <FormField
      control={control}
      name={`forms.${formIndex}.questions.${questionIndex}.options`}
      render={() => (
        <FormItem className="mt-4">
          <FormLabel>Options</FormLabel>
          <div className="space-y-2">
            {fields.map((field, optionIndex) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`forms.${formIndex}.questions.${questionIndex}.options.${optionIndex}`}
                  render={({ field: optionField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          value={
                            typeof optionField.value === 'string' &&
                            optionField.value.endsWith(CUSTOM_INPUT_TOKEN)
                              ? optionField.value.slice(
                                  0,
                                  -CUSTOM_INPUT_TOKEN.length
                                )
                              : optionField.value ?? ''
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          disabled={isLoading}
                          onChange={(e) => {
                            const nextBase = e.target.value
                            const isCustom =
                              typeof optionField.value === 'string' &&
                              optionField.value.endsWith(CUSTOM_INPUT_TOKEN)
                            optionField.onChange(
                              isCustom
                                ? `${nextBase}${CUSTOM_INPUT_TOKEN}`
                                : nextBase
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Allow input toggle (per option) */}
                <FormField
                  control={control}
                  name={`forms.${formIndex}.questions.${questionIndex}.options.${optionIndex}`}
                  render={({ field: optionField }) => {
                    const rawValue = optionField.value ?? ''
                    const isCustom =
                      typeof rawValue === 'string' &&
                      rawValue.endsWith(CUSTOM_INPUT_TOKEN)
                    const baseLabel = isCustom
                      ? rawValue.slice(0, -CUSTOM_INPUT_TOKEN.length)
                      : rawValue

                    return (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isLoading}
                        onClick={() => {
                          optionField.onChange(
                            isCustom
                              ? baseLabel
                              : `${baseLabel}${CUSTOM_INPUT_TOKEN}`
                          )
                        }}
                        className={
                          isCustom
                            ? 'bg-bgColor-brand600 text-white hover:bg-bgColor-brand600'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }
                      >
                        Allow input
                      </Button>
                    )
                  }}
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
            {fieldType === 'single_choice' ? 'radio buttons.' : 'checkboxes.'}
          </p>
        </FormItem>
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// ConditionFields — rendered when a linked question is selected
// ---------------------------------------------------------------------------
interface ConditionFieldsProps {
  form: any
  formIndex: number
  questionIndex: number
  linkedQuestion: LinkableQuestion
  isLoading: boolean
}

const ConditionFields = ({
  form,
  formIndex,
  questionIndex,
  linkedQuestion,
  isLoading,
}: ConditionFieldsProps) => {
  const base = `forms.${formIndex}.questions.${questionIndex}.condition`

  /* ── Number type ── */
  if (linkedQuestion.type === 'number') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          This question will show when the linked answer…
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`${base}.numberOperator`}
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger disabled={isLoading}>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="eq">is equal to</SelectItem>
                    <SelectItem value="lt">is less than</SelectItem>
                    <SelectItem value="gt">is greater than</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${base}.numberValue`}
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter number"
                    disabled={isLoading}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    )
  }

  /* ── Single choice / Multiple choice ── */
  // When building conditions, hide "Allow input" options (stored as *:$customInput$*)
  // so the condition builder can't select them.
  const CUSTOM_INPUT_TOKEN = ':$customInput$'
  const choices = (linkedQuestion.options ?? []).filter(
    (opt) => !opt.endsWith(CUSTOM_INPUT_TOKEN)
  )
  const selectedChoices: string[] = form.watch(`${base}.selectedChoices`) ?? []

  const toggleChoice = (choice: string) => {
    const current: string[] = form.getValues(`${base}.selectedChoices`) ?? []
    const updated = current.includes(choice)
      ? current.filter((c: string) => c !== choice)
      : [...current, choice]
    form.setValue(`${base}.selectedChoices`, updated.length > 0 ? updated : undefined)
  }

  return (
    <div className="space-y-3">
      {/* Match mode — only for multi_choice */}
      {linkedQuestion.type === 'multi_choice' && (
        <FormField
          control={form.control}
          name={`${base}.matchMode`}
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Match mode</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder="Select match mode…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">
                    Any of the selected choices matches
                  </SelectItem>
                  <SelectItem value="all">
                    All of the selected choices must match
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Choice list */}
      <div>
        <FormLabel>Show when participant selects…</FormLabel>
        {linkedQuestion.type === 'single_choice' && (
          <p className="mb-2 mt-1 text-xs text-muted-foreground">
            This question will appear if the participant picks any of the
            choices checked below.
          </p>
        )}
        {choices.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            The linked question has no options defined yet.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {choices.map((choice) => (
              <label
                key={choice}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selectedChoices.includes(choice)}
                  onCheckedChange={() => toggleChoice(choice)}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-bgColor-brand900 data-[state=checked]:border-bgColor-brand900"
                />
                <span className="text-sm text-slate-700">
                  {choice.endsWith(CUSTOM_INPUT_TOKEN)
                    ? choice.slice(0, -CUSTOM_INPUT_TOKEN.length)
                    : choice}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SortableQuestionCard
// ---------------------------------------------------------------------------
interface SortableQuestionCardProps {
  id: string
  formIndex: number
  questionIndex: number
  form: ReturnType<typeof useForm<EventFormsValues>>
  isLoading: boolean
  onRemove: (index: number) => void
  isChoiceType: (type: QuestionType) => boolean
  linkableQuestions: LinkableQuestion[]
}

const SortableQuestionCard = ({
  id,
  formIndex,
  questionIndex,
  form,
  isLoading,
  onRemove,
  isChoiceType,
  linkableQuestions,
}: SortableQuestionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const fieldType = form.watch(
    `forms.${formIndex}.questions.${questionIndex}.type`
  )

  const linkedQuestionId = form.watch(
    `forms.${formIndex}.questions.${questionIndex}.linkedQuestionId`
  )

  const [isLinkEnabled, setIsLinkEnabled] = useState(!!linkedQuestionId)

  const handleLinkToggle = (checked: boolean) => {
    setIsLinkEnabled(checked)
    if (!checked) {
      form.setValue(
        `forms.${formIndex}.questions.${questionIndex}.linkedQuestionId`,
        undefined
      )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            Question {questionIndex + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          disabled={isLoading}
          onClick={() => onRemove(questionIndex)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`forms.${formIndex}.questions.${questionIndex}.question`}
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
          name={`forms.${formIndex}.questions.${questionIndex}.description`}
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
          name={`forms.${formIndex}.questions.${questionIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected answer format</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  if (value === 'single_choice' || value === 'multi_choice') {
                    const currentOptions = form.getValues(
                      `forms.${formIndex}.questions.${questionIndex}.options`
                    )
                    if (
                      !currentOptions ||
                      !Array.isArray(currentOptions) ||
                      currentOptions.length === 0
                    ) {
                      form.setValue(
                        `forms.${formIndex}.questions.${questionIndex}.options`,
                        ['']
                      )
                    }
                  } else {
                    form.setValue(
                      `forms.${formIndex}.questions.${questionIndex}.options`,
                      undefined
                    )
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
                  <SelectItem value="short_text">Short text</SelectItem>
                  <SelectItem value="long_text">Long text</SelectItem>
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
          name={`forms.${formIndex}.questions.${questionIndex}.required`}
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
          formIndex={formIndex}
          questionIndex={questionIndex}
          fieldType={fieldType}
          isLoading={isLoading}
        />
      )}

      {/* Link Question — only available from the 2nd form onwards */}
      {formIndex > 0 && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <FormItem className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
            <div className="space-y-0.5">
              <FormLabel>Link question</FormLabel>
              <p className="text-xs text-muted-foreground">
                Tie this question to a question from the previous form.
              </p>
            </div>
            <Switch
              checked={isLinkEnabled}
              onCheckedChange={handleLinkToggle}
              disabled={isLoading || linkableQuestions.length === 0}
              className="data-[state=checked]:bg-bgColor-brand900"
            />
          </FormItem>

          {isLinkEnabled && (
            <FormField
              control={form.control}
              name={`forms.${formIndex}.questions.${questionIndex}.linkedQuestionId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked question (previous form)</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      // Clear stale condition when the linked question changes
                      form.setValue(
                        `forms.${formIndex}.questions.${questionIndex}.condition`,
                        undefined
                      )
                    }}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question to link" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {linkableQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          <span>{q.question || '(untitled)'}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({q.type.replace(/_/g, ' ')})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Condition builder — shown once a linked question is chosen */}
          {isLinkEnabled && linkedQuestionId && (() => {
            const linked = linkableQuestions.find((q) => q.id === linkedQuestionId)
            return linked ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Display condition
                </p>
                <ConditionFields
                  form={form}
                  formIndex={formIndex}
                  questionIndex={questionIndex}
                  linkedQuestion={linked}
                  isLoading={isLoading}
                />
              </div>
            ) : null
          })()}

          {isLinkEnabled && linkableQuestions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No linkable questions in the previous form. Add a number, single
              choice, or multiple choice question there first.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FormPanel — one column in the horizontal layout
// ---------------------------------------------------------------------------
interface FormPanelProps {
  formIndex: number
  form: ReturnType<typeof useForm<EventFormsValues>>
  isLoading: boolean
  onRemoveForm: (index: number) => void
  totalForms: number
  panelWidth: string
  isChoiceType: (type: QuestionType) => boolean
}

const FormPanel = ({
  formIndex,
  form,
  isLoading,
  onRemoveForm,
  totalForms,
  panelWidth,
  isChoiceType,
}: FormPanelProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `forms.${formIndex}.questions` as const,
  })

  const previousQuestions: z.infer<typeof QuestionSchema>[] =
    formIndex > 0
      ? (form.watch(`forms.${formIndex - 1}.questions`) ?? [])
      : []

  const linkableQuestions: LinkableQuestion[] = previousQuestions
    .filter((q) => (LINKABLE_TYPES as readonly string[]).includes(q.type))
    .map((q) => ({ id: q.id, question: q.question, type: q.type, options: q.options }))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = fields.findIndex((f) => f.id === active.id)
    const toIndex = fields.findIndex((f) => f.id === over.id)
    if (fromIndex !== -1 && toIndex !== -1) {
      move(fromIndex, toIndex)
    }
  }

  return (
    <div
      style={{ width: panelWidth, minWidth: '240px', flexShrink: 0 }}
      className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="font-semibold text-slate-700">
          Form {formIndex + 1}
        </span>
        {totalForms > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            disabled={isLoading}
            onClick={() => onRemoveForm(formIndex)}
            aria-label={`Remove form ${formIndex + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Questions area */}
      <div className="flex-1 p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field, questionIndex) => (
                <SortableQuestionCard
                  key={field.id}
                  id={field.id}
                  formIndex={formIndex}
                  questionIndex={questionIndex}
                  form={form}
                  isLoading={isLoading}
                  onRemove={remove}
                  isChoiceType={isChoiceType}
                  linkableQuestions={linkableQuestions}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createEmptyQuestion())}
          disabled={isLoading}
          className="mt-4 flex w-full items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventForm — main component
// ---------------------------------------------------------------------------
const EventForm = ({ event }: EventFormProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EventFormsValues>({
    resolver: zodResolver(EventFormsSchema),
    defaultValues: {
      forms: [createEmptyForm()],
    },
  })

  const {
    fields: formFields,
    append: appendForm,
    remove: removeForm,
  } = useFieldArray({
    control: form.control,
    name: 'forms',
  })

  // Load existing form definition (if any)
  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const data = await getEventForm(event.id)
        if (!data || !Array.isArray(data) || data.length === 0) return

        form.reset({ forms: data })
      } catch (error) {
        console.error('Failed to load event form definition', error)
      }
    }

    fetchFormDefinition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id])

  const onSubmit = async (values: EventFormsValues) => {
    try {
      setIsLoading(true)

      const hasAnyQuestions = values.forms.some((f) => f.questions.length > 0)

      if (!hasAnyQuestions) {
        await axiosInstance.put(`/api/events/forms/${event.id}`, {
          formData: null,
        })
        toast.success('Event registration form cleared.', {
          description: 'All custom questions have been removed for this event.',
          style: { color: '#22c55e' },
        })
        return
      }

      // Clean: filter out blank options from choice-type questions
      const cleanedForms = values.forms.map((f, formIndex) => ({
        questions: f.questions.map((q) => ({
          ...q,
          formNumber: formIndex + 1, // 1-based order
          options: q.options
            ? (q.options
                .map((opt) => {
                  const trimmed = opt.trim()
                  if (trimmed.endsWith(CUSTOM_INPUT_TOKEN)) {
                    const base = trimmed.slice(
                      0,
                      -CUSTOM_INPUT_TOKEN.length
                    ).trim()
                    return base.length ? `${base}${CUSTOM_INPUT_TOKEN}` : undefined
                  }
                  return trimmed.length ? trimmed : undefined
                })
                .filter(Boolean) as string[])
            : undefined,
        })),
      }))

      // Save as JSON array of form objects
      await axiosInstance.put(`/api/events/forms/${event.id}`, {
        formData: cleanedForms,
      })

      toast.success('Event registration form definition saved.', {
        description:
          'Your questions and expected answer formats have been updated.',
        style: { color: '#22c55e' },
      })
    } catch (error) {
      console.error(error)
      toast.error('Unable to save event registration form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isChoiceType = (type: QuestionType) =>
    type === 'single_choice' || type === 'multi_choice'

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Custom Registration Questions</h3>
            <p className="text-sm text-muted-foreground">
              Design the questions participants must answer when registering for
              this event. This form will be displayed after the purchase button,
              after users fill in their personal information.
            </p>
            <p className="text-sm text-muted-foreground">
              You can drag and drop questions to reorder them. Add multiple forms
              using the button on the right.
            </p>
            <p className="text-sm text-muted-foreground"> Linked questions are only shown after second form, and you can only link number, single choice and multiple choice questions (custom input options will be ignored).</p>

          </div>

          {/* "Add new form" lives here when there are 3+ forms */}
          {formFields.length >= 3 && (
            <button
              type="button"
              onClick={() => appendForm(createEmptyForm())}
              disabled={isLoading}
              className="flex shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add new form
            </button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Up to 2 form panels visible; 3rd+ scrolls horizontally */}
            {(() => {
              const count = formFields.length
              // 1 form  → panel 2/3, button 1/3 (fills row perfectly)
              // 2 forms → each panel 1/3, button 1/3 (fills row perfectly)
              // 3+ forms → each 1/3 → total > 100% → scroll; button moved to header
              const SLOT = 'calc(33.333% - 8px)'
              const panelWidth = count === 1 ? 'calc(66.667% - 8px)' : SLOT

              return (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-4">
                    {formFields.map((formField, formIndex) => (
                      <FormPanel
                        key={formField.id}
                        formIndex={formIndex}
                        form={form}
                        isLoading={isLoading}
                        onRemoveForm={removeForm}
                        totalForms={count}
                        panelWidth={panelWidth}
                        isChoiceType={isChoiceType}
                      />
                    ))}

                    {/* "Add new form" in the row only when there are 1–2 forms */}
                    {count < 3 && (
                      <button
                        type="button"
                        onClick={() => appendForm(createEmptyForm())}
                        disabled={isLoading}
                        style={{ width: SLOT, minWidth: '160px', flexShrink: 0 }}
                        className="flex h-24 items-center justify-center gap-2 self-start rounded-md border-2 border-dashed border-slate-300 text-sm text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-5 w-5" />
                        Add new form
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}

            <div className="flex justify-end">
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

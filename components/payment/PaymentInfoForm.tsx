'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Loader2 } from 'lucide-react'
import { FormQuestion } from '@/lib/actions/event/getEventForm'
export type FormResponseValue = string | string[]

export interface FormResponseWithMeta {
    answer: FormResponseValue
    formNumber: number
}

export interface FormResponses {
    [questionId: string]: FormResponseWithMeta
}

const CUSTOM_INPUT_TOKEN = ':$customInput$'

interface PaymentInfoFormProps {
    questions: FormQuestion[]
    onSubmit: (responses: FormResponses) => void
    onBack?: (responses: FormResponses) => void
    isLoading?: boolean
    buttonText?: string
    initialResponses?: FormResponses
}

export default function PaymentInfoForm({
    questions,
    onSubmit,
    onBack,
    isLoading = false,
    buttonText,
    initialResponses = {},
}: PaymentInfoFormProps) {
    // @ts-ignore: useTranslation will always throw an error for TypeScript
    const { t } = useTranslation('event')

    const [formResponses, setFormResponses] = useState<FormResponses>(initialResponses)
    const [customInputDrafts, setCustomInputDrafts] = useState<Record<string, string>>({})
    const [invalidQuestionIds, setInvalidQuestionIds] = useState<string[]>([])
    const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>(
        {}
    )

    const scheduleDebouncedCommit = (key: string, commit: () => void) => {
        const existing = debounceTimersRef.current[key]
        if (existing) clearTimeout(existing)
        debounceTimersRef.current[key] = setTimeout(commit, 300)
    }

    const getQuestionFormNumber = (question: FormQuestion) =>
        typeof question.formNumber === 'number' ? question.formNumber : 0

    // When the dialog navigates (back/next), rehydrate this step from the saved answers.
    useEffect(() => {
        setFormResponses(initialResponses)
        setCustomInputDrafts({})
        const timers = debounceTimersRef.current
        Object.keys(timers).forEach((k) => {
            const t = timers[k]
            if (t) clearTimeout(t)
        })
        debounceTimersRef.current = {}
    }, [initialResponses])

    useEffect(() => {
        return () => {
            const timers = debounceTimersRef.current
            Object.keys(timers).forEach((k) => {
                const t = timers[k]
                if (t) clearTimeout(t)
            })
        }
    }, [])

    useEffect(() => {
        if (invalidQuestionIds.length === 0) return
        const nextInvalids = invalidQuestionIds.filter((questionId) => {
            const question = questions.find((q) => q.id === questionId)
            if (!question?.required) return false

            const value = formResponses[question.id]?.answer
            if (question.type === 'multi_choice') {
                return !Array.isArray(value) || value.length === 0
            }
            return typeof value !== 'string' || value.trim() === ''
        })
        if (nextInvalids.length !== invalidQuestionIds.length) {
            setInvalidQuestionIds(nextInvalids)
        }
    }, [formResponses, invalidQuestionIds, questions])

    const getStringValue = (questionId: string) => {
        const entry = formResponses[questionId]
        return typeof entry?.answer === 'string' ? entry.answer : ''
    }

    const escapeSingleQuotedText = (input: string): string => {
        // Keep stored format parseable:
        // <option>:'<text>'
        // We escape backslashes and single quotes.
        return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    }

    const unescapeSingleQuotedText = (input: string): string => {
        return input.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
    }

    const handleSubmit = () => {
        // Validate required fields
        const requiredQuestions = questions.filter(q => q.required)
        const missingResponses = requiredQuestions.filter((q) => {
            const value = formResponses[q.id]?.answer
            if (q.type === 'multi_choice') {
                return !Array.isArray(value) || value.length === 0
            }
            if (typeof value !== 'string') return true
            return value.trim() === ''
        })

        if (missingResponses.length > 0) {
            const missingIds = missingResponses.map((q) => q.id)
            setInvalidQuestionIds(missingIds)
            toast.error(t('form-validation-error'), {
                description: t('form-validation-description', { count: missingResponses.length }),
                style: { color: '#ef4444' },
            })
            return
        }

        setInvalidQuestionIds([])
        onSubmit(formResponses)
    }

    if (questions.length === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6 py-4">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className={`space-y-2 rounded-md border p-3 transition-colors ${
                            invalidQuestionIds.includes(question.id)
                                ? 'border-red-500'
                                : 'border-transparent'
                        }`}
                    >
                        <Label htmlFor={question.id} className="text-sm font-medium">
                            {index + 1}. {question.question}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {question.description && (
                            <div className="whitespace-pre-line text-sm text-gray-500">
                                {question.description}
                            </div>
                        )}

                        {question.type === 'short_text' && (
                            <Input
                                id={question.id}
                                type="text"
                                value={getStringValue(question.id)}
                                onChange={(e) =>
                                    setFormResponses((prev) => ({
                                        ...prev,
                                        [question.id]: {
                                            answer: e.target.value,
                                            formNumber:
                                                getQuestionFormNumber(question),
                                        },
                                    }))
                                }
                                placeholder="Your answer"
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'long_text' && (
                            <Textarea
                                id={question.id}
                                value={getStringValue(question.id)}
                                onChange={(e) =>
                                    setFormResponses((prev) => ({
                                        ...prev,
                                        [question.id]: {
                                            answer: e.target.value,
                                            formNumber:
                                                getQuestionFormNumber(question),
                                        },
                                    }))
                                }
                                placeholder="Your answer"
                                rows={4}
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'number' && (
                            <Input
                                id={question.id}
                                type="number"
                                value={getStringValue(question.id)}
                                onChange={(e) =>
                                    setFormResponses((prev) => ({
                                        ...prev,
                                        [question.id]: {
                                            answer: e.target.value,
                                            formNumber:
                                                getQuestionFormNumber(question),
                                        },
                                    }))
                                }
                                placeholder="Enter a number"
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'date' && (
                            <Input
                                id={question.id}
                                type="date"
                                value={getStringValue(question.id)}
                                onChange={(e) =>
                                    setFormResponses((prev) => ({
                                        ...prev,
                                        [question.id]: {
                                            answer: e.target.value,
                                            formNumber:
                                                getQuestionFormNumber(question),
                                        },
                                    }))
                                }
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'single_choice' && question.options && (
                            (() => {
                                const raw = getStringValue(question.id)
                                const selectedRadioValue =
                                    question.options.find(
                                        (opt) =>
                                            raw === opt ||
                                            (opt.endsWith(CUSTOM_INPUT_TOKEN) &&
                                                raw.startsWith(opt))
                                    ) ?? raw

                                return (
                                    <RadioGroup
                                        value={selectedRadioValue}
                                        onValueChange={(value) =>
                                            setFormResponses((prev) => ({
                                                ...prev,
                                                [question.id]: {
                                                    answer: value,
                                                    formNumber:
                                                        getQuestionFormNumber(
                                                            question
                                                        ),
                                                },
                                            }))
                                        }
                                        disabled={isLoading}
                                    >
                                        {question.options.map((option, optionIndex) => {
                                            const isCustom =
                                                option.endsWith(CUSTOM_INPUT_TOKEN)
                                            const displayLabel = isCustom
                                                ? option.slice(
                                                    0,
                                                    -CUSTOM_INPUT_TOKEN.length
                                                )
                                                : option

                                            const isSelected =
                                                selectedRadioValue === option
                                            const customText =
                                                isCustom &&
                                                    isSelected &&
                                                    raw.startsWith(option + ':')
                                                    ? raw.slice(option.length + 1)
                                                    : ''
                                            const customDraftKey = `${question.id}::radio::${optionIndex}`

                                            return (
                                                <div
                                                    key={optionIndex}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value={option}
                                                            id={`${question.id}-${optionIndex}`}
                                                            disabled={isLoading}
                                                        />
                                                        <Label
                                                            htmlFor={`${question.id}-${optionIndex}`}
                                                            className="font-normal cursor-pointer"
                                                        >
                                                            {displayLabel}
                                                        </Label>

                                                        {isCustom &&
                                                            isSelected && (
                                                                <Input
                                                                    className="ml-6"
                                                                    type="text"
                                                                    placeholder="Please type your answer here"
                                                                    value={
                                                                        customInputDrafts[customDraftKey] ??
                                                                        customText
                                                                    }
                                                                    onChange={(e) => {
                                                                        const next = e.target.value
                                                                        setCustomInputDrafts(
                                                                            (prevDrafts) => ({
                                                                                ...prevDrafts,
                                                                                [customDraftKey]: next,
                                                                            })
                                                                        )

                                                                        scheduleDebouncedCommit(
                                                                            customDraftKey,
                                                                            () => {
                                                                                setFormResponses(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [question.id]: {
                                                                                            answer:
                                                                                                next.trim()
                                                                                                    .length >
                                                                                                0
                                                                                                    ? `${option}:${next}`
                                                                                                    : option,
                                                                                            formNumber:
                                                                                                getQuestionFormNumber(
                                                                                                    question
                                                                                                ),
                                                                                        },
                                                                                    })
                                                                                )
                                                                            }
                                                                        )
                                                                    }}
                                                                    disabled={isLoading}
                                                                />
                                                            )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                )
                            })()
                        )}

                        {question.type === 'multi_choice' && question.options && (
                            <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                    const entry = formResponses[question.id]
                                    const entries = Array.isArray(entry?.answer)
                                        ? entry.answer
                                        : []

                                    const isCustom =
                                        option.endsWith(CUSTOM_INPUT_TOKEN)

                                    const customPrefix = `${option}:'`

                                    const customEntry = isCustom
                                        ? entries.find(
                                            (e) =>
                                                typeof e === 'string' &&
                                                e.startsWith(customPrefix) &&
                                                e.endsWith("'")
                                        )
                                        : undefined

                                    const customText = customEntry
                                        ? unescapeSingleQuotedText(
                                            customEntry.slice(
                                                customPrefix.length,
                                                -1
                                            )
                                        )
                                        : ''
                                    const customDraftKey = `${question.id}::${optionIndex}`

                                    const isChecked = isCustom
                                        ? entries.some(
                                            (e) =>
                                                e === option ||
                                                (typeof e === 'string' &&
                                                    e.startsWith(customPrefix))
                                        )
                                        : entries.includes(option)

                                    const displayLabel = isCustom
                                        ? option.slice(0, -CUSTOM_INPUT_TOKEN.length)
                                        : option

                                    return (
                                        <div
                                            key={optionIndex}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${question.id}-${optionIndex}`}
                                                    checked={isChecked}
                                                    disabled={isLoading}
                                                    onCheckedChange={(checked) => {
                                                        const nextChecked =
                                                            Boolean(checked)
                                                        const formNumber =
                                                            getQuestionFormNumber(
                                                                question
                                                            )

                                                        setFormResponses((prev) => {
                                                            const prevEntry =
                                                                prev[question.id]
                                                            const current: string[] =
                                                                Array.isArray(prevEntry?.answer)
                                                                    ? prevEntry.answer
                                                                    : []

                                                            const removeThis = (
                                                                e: string
                                                            ) => {
                                                                if (!isCustom) return e === option
                                                                return (
                                                                    e === option ||
                                                                    (typeof e === 'string' &&
                                                                        e.startsWith(customPrefix))
                                                                )
                                                            }

                                                            const filtered = current.filter(
                                                                (e: string) =>
                                                                    !removeThis(e)
                                                            )

                                                            if (!nextChecked) {
                                                                if (isCustom) {
                                                                    setCustomInputDrafts((prevDrafts) => {
                                                                        if (!(customDraftKey in prevDrafts)) return prevDrafts
                                                                        const { [customDraftKey]: _, ...rest } = prevDrafts
                                                                        return rest
                                                                    })
                                                                    const t =
                                                                        debounceTimersRef.current[
                                                                            customDraftKey
                                                                        ]
                                                                    if (t) {
                                                                        clearTimeout(t)
                                                                        debounceTimersRef.current[
                                                                            customDraftKey
                                                                        ] = undefined
                                                                    }
                                                                }
                                                                return {
                                                                    ...prev,
                                                                    [question.id]: {
                                                                        answer: filtered,
                                                                        formNumber,
                                                                    },
                                                                }
                                                            }

                                                            // When enabling custom option for the first time,
                                                            // store the token-only value until user types.
                                                            const nextValue = isCustom
                                                                ? option
                                                                : option

                                                            return {
                                                                ...prev,
                                                                [question.id]: {
                                                                    answer: [
                                                                        ...filtered,
                                                                        nextValue,
                                                                    ],
                                                                    formNumber,
                                                                },
                                                            }
                                                        })
                                                    }}
                                                />

                                                <Label
                                                    htmlFor={`${question.id}-${optionIndex}`}
                                                    className="font-normal cursor-pointer"
                                                >
                                                    {displayLabel}
                                                </Label>

                                                {isCustom && isChecked && (
                                                    <Input
                                                        className="ml-6 h-7"
                                                        type="text"
                                                        placeholder="Please type your answer here"
                                                        value={customInputDrafts[customDraftKey] ?? customText}
                                                        onChange={(e) => {
                                                            const next = e.target.value
                                                            setCustomInputDrafts((prevDrafts) => ({
                                                                ...prevDrafts,
                                                                [customDraftKey]: next,
                                                            }))

                                                            scheduleDebouncedCommit(
                                                                customDraftKey,
                                                                () => {
                                                                    setFormResponses((prev) => {
                                                                        const formNumber =
                                                                            getQuestionFormNumber(
                                                                                question
                                                                            )
                                                                        const prevEntry =
                                                                            prev[question.id]
                                                                        const current: string[] =
                                                                            Array.isArray(prevEntry?.answer)
                                                                                ? prevEntry.answer
                                                                                : []

                                                                        const filtered =
                                                                            current.filter(
                                                                                (ent: string) =>
                                                                                    !(
                                                                                        ent ===
                                                                                            option ||
                                                                                        ent.startsWith(
                                                                                            customPrefix
                                                                                        )
                                                                                    )
                                                                            )

                                                                        const customEntryValue =
                                                                            next.trim().length > 0
                                                                                ? `${option}:'${escapeSingleQuotedText(next)}'`
                                                                                : option

                                                                        return {
                                                                            ...prev,
                                                                            [question.id]: {
                                                                                answer: [
                                                                                    ...filtered,
                                                                                    customEntryValue,
                                                                                ],
                                                                                formNumber,
                                                                            },
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }}
                                                        disabled={isLoading}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                {onBack && (
                    <Button
                        variant="outline"
                        onClick={() => onBack?.(formResponses)}
                        className="flex-1"
                        disabled={isLoading}
                        type="button"
                    >
                        {t('back-button')}
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={isLoading}
                    type="button"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('processing')}
                        </>
                    ) : (
                        <>
                            {buttonText || t('continue-to-payment')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}


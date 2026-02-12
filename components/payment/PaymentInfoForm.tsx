'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Loader2 } from 'lucide-react'
import { EventFormData } from '@/lib/actions/event/getEventForm'

export interface FormResponses {
    [questionId: string]: string
}

interface PaymentInfoFormProps {
    eventFormData: EventFormData
    onSubmit: (responses: FormResponses) => void
    onBack?: () => void
    isLoading?: boolean
    buttonText?: string
}

export default function PaymentInfoForm({
    eventFormData,
    onSubmit,
    onBack,
    isLoading = false,
    buttonText,
}: PaymentInfoFormProps) {
    // @ts-ignore: useTranslation will always throw an error for TypeScript
    const { t } = useTranslation('event')

    const [formResponses, setFormResponses] = useState<FormResponses>({})

    const handleSubmit = () => {
        // Validate required fields
        const requiredQuestions = eventFormData?.questions.filter(q => q.required) || []
        const missingResponses = requiredQuestions.filter(
            q => !formResponses[q.id] || formResponses[q.id].trim() === ''
        )

        if (missingResponses.length > 0) {
            toast.error('Please answer all required questions', {
                description: `${missingResponses.length} required question(s) need to be answered.`,
                style: { color: '#ef4444' },
            })
            return
        }

        onSubmit(formResponses)
    }

    if (!eventFormData || !eventFormData.questions || eventFormData.questions.length === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6 py-4">
                {eventFormData.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                        <Label htmlFor={question.id} className="text-sm font-medium">
                            {index + 1}. {question.question}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {question.description && (
                            <p className="text-sm text-gray-500">{question.description}</p>
                        )}

                        {question.type === 'short_text' && (
                            <Input
                                id={question.id}
                                type="text"
                                value={formResponses[question.id] || ''}
                                onChange={(e) =>
                                    setFormResponses(prev => ({ ...prev, [question.id]: e.target.value }))
                                }
                                placeholder="Your answer"
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'long_text' && (
                            <Textarea
                                id={question.id}
                                value={formResponses[question.id] || ''}
                                onChange={(e) =>
                                    setFormResponses(prev => ({ ...prev, [question.id]: e.target.value }))
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
                                value={formResponses[question.id] || ''}
                                onChange={(e) =>
                                    setFormResponses(prev => ({ ...prev, [question.id]: e.target.value }))
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
                                value={formResponses[question.id] || ''}
                                onChange={(e) =>
                                    setFormResponses(prev => ({ ...prev, [question.id]: e.target.value }))
                                }
                                required={question.required}
                                disabled={isLoading}
                            />
                        )}

                        {question.type === 'single_choice' && question.options && (
                            <RadioGroup
                                value={formResponses[question.id] || ''}
                                onValueChange={(value) =>
                                    setFormResponses(prev => ({ ...prev, [question.id]: value }))
                                }
                                disabled={isLoading}
                            >
                                {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={option}
                                            id={`${question.id}-${optionIndex}`}
                                            disabled={isLoading}
                                        />
                                        <Label
                                            htmlFor={`${question.id}-${optionIndex}`}
                                            className="font-normal cursor-pointer"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {question.type === 'multi_choice' && question.options && (
                            <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                    const currentValues = formResponses[question.id]
                                        ? formResponses[question.id].split(',').map(v => v.trim())
                                        : []
                                    const isChecked = currentValues.includes(option)

                                    return (
                                        <div key={optionIndex} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${question.id}-${optionIndex}`}
                                                checked={isChecked}
                                                disabled={isLoading}
                                                onCheckedChange={(checked) => {
                                                    let newValues = [...currentValues]
                                                    if (checked) {
                                                        newValues.push(option)
                                                    } else {
                                                        newValues = newValues.filter(v => v !== option)
                                                    }
                                                    setFormResponses(prev => ({
                                                        ...prev,
                                                        [question.id]: newValues.join(', '),
                                                    }))
                                                }}
                                            />
                                            <Label
                                                htmlFor={`${question.id}-${optionIndex}`}
                                                className="font-normal cursor-pointer"
                                            >
                                                {option}
                                            </Label>
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
                        onClick={onBack}
                        className="flex-1"
                        disabled={isLoading}
                        type="button"
                    >
                        Back
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
                            Processing...
                        </>
                    ) : (
                        <>
                            {buttonText || 'Continue to Payment'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}


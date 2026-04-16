'use client'

import { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi'
import { ExpenseCategoryType, ExpensePaymentMethod } from '@prisma/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import Loader from '@/components/loader/Loader'
import ExportToExcelButton from '@/components/button/ExportToExcelButton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { axiosInstance } from '@/lib/axios'

// ---------------------------------------------------------------------------
// Types for table display rows (from the database, Decimal fields arrive as
// objects that have a toString() method)
// ---------------------------------------------------------------------------

type ReceiptItemRow = {
  id: string
  description: string
  quantity: number | { toString(): string }
  unitPrice: number | { toString(): string }
  taxAmount: number | { toString(): string } | null
  discount: number | { toString(): string } | null
  lineTotal: number | { toString(): string }
}

type ReceiptRow = {
  id: string
  receiptNumber: string | null
  receiptDate: Date | string
  merchantName: string
  merchantAddress?: string | null
  totalAmount: number | { toString(): string }
  currency: string
  subtotal?: number | { toString(): string } | null
  taxAmount?: number | { toString(): string } | null
  tipAmount?: number | { toString(): string } | null
  discountAmount?: number | { toString(): string } | null
  note?: string | null
  paymentMethod: ExpensePaymentMethod
  paymentReference?: string | null
  hasReimbursed?: boolean
  category: ExpenseCategoryType
  receiptImageUrl?: string | null
  rawText?: string | null
  items: ReceiptItemRow[]
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const receiptItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  lineTotal: z.coerce.number().min(0),
})

const receiptSchema = z.object({
  receiptNumber: z.string().optional(),
  receiptDate: z.string().optional(),
  merchantName: z.string().min(1, 'Merchant name is required'),
  merchantAddress: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0),
  tipAmount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0),
  totalAmount: z.coerce.number().min(0, 'Total amount must be ≥ 0'),
  note: z.string().optional(),
  paymentMethod: z.nativeEnum(ExpensePaymentMethod),
  paymentReference: z.string().optional(),
  hasReimbursed: z.boolean(),
  category: z.nativeEnum(ExpenseCategoryType),
  receiptImageUrl: z.string().optional(),
  rawText: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, 'At least one item is required'),
})

type ReceiptFormValues = z.infer<typeof receiptSchema>

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const defaultItemValues = (): z.infer<typeof receiptItemSchema> => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxAmount: 0,
  discount: 0,
  lineTotal: 0,
})

const defaultReceiptValues = (): ReceiptFormValues => ({
  receiptNumber: '',
  receiptDate: '',
  merchantName: '',
  merchantAddress: '',
  currency: 'CAD',
  subtotal: 0,
  taxAmount: 0,
  tipAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  note: '',
  paymentMethod: ExpensePaymentMethod.Other,
  paymentReference: '',
  hasReimbursed: false,
  category: ExpenseCategoryType.Other,
  receiptImageUrl: '',
  rawText: '',
  items: [defaultItemValues()],
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(value: number | { toString(): string } | null | undefined) {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value.toString())
}

function formatDateForInput(dateValue?: string | Date | null) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VVFFinance({ receipts }: { receipts: ReceiptRow[] }) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [imagePreview, setImagePreview] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null)

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: defaultReceiptValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const isSubmitting = form.formState.isSubmitting

  const totalSpent = useMemo(
    () => receipts.reduce((sum, receipt) => sum + toNumber(receipt.totalAmount), 0),
    [receipts],
  )

  const toggleRow = (receiptId: string) => {
    setExpandedRows((prev) => ({ ...prev, [receiptId]: !prev[receiptId] }))
  }

  const openAddReceiptDialog = () => {
    setEditingReceiptId(null)
    setImagePreview('')
    form.reset(defaultReceiptValues())
    setIsDialogOpen(true)
  }

  const handleEditReceipt = (receipt: ReceiptRow) => {
    setEditingReceiptId(receipt.id)
    setImagePreview(receipt.receiptImageUrl || '')
    form.reset({
      receiptNumber: receipt.receiptNumber ?? '',
      receiptDate: formatDateForInput(receipt.receiptDate),
      merchantName: receipt.merchantName ?? '',
      merchantAddress: receipt.merchantAddress ?? '',
      currency: receipt.currency ?? 'CAD',
      subtotal: toNumber(receipt.subtotal),
      taxAmount: toNumber(receipt.taxAmount),
      tipAmount: toNumber(receipt.tipAmount),
      discountAmount: toNumber(receipt.discountAmount),
      totalAmount: toNumber(receipt.totalAmount),
      note: receipt.note ?? '',
      paymentMethod: receipt.paymentMethod ?? ExpensePaymentMethod.Other,
      paymentReference: receipt.paymentReference ?? '',
      hasReimbursed: Boolean(receipt.hasReimbursed),
      category: receipt.category ?? ExpenseCategoryType.Other,
      receiptImageUrl: receipt.receiptImageUrl ?? '',
      rawText: receipt.rawText ?? '',
      items:
        receipt.items.length > 0
          ? receipt.items.map((item) => ({
              description: item.description ?? '',
              quantity: toNumber(item.quantity),
              unitPrice: toNumber(item.unitPrice),
              taxAmount: toNumber(item.taxAmount),
              discount: toNumber(item.discount),
              lineTotal: toNumber(item.lineTotal),
            }))
          : [defaultItemValues()],
    })
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosInstance.post('/api/receipts/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.status !== 200) throw new Error('Failed to upload image')

      const data = response.data as { url?: string }
      if (!data.url) throw new Error('Upload response missing url')

      const uploadedUrl = data.url
      setImagePreview(uploadedUrl)
      form.setValue('receiptImageUrl', uploadedUrl)

      const extractResponse = await axiosInstance.post('/api/receipts/extract', {
        imageUrl: uploadedUrl,
      })
      const extracted = extractResponse.data as {
        receipt?: Partial<ReceiptFormValues> & {
          items?: Array<Partial<z.infer<typeof receiptItemSchema>>>
        }
      }
      const extractedReceipt = extracted.receipt

      if (extractedReceipt) {
        const current = form.getValues()
        form.reset({
          ...current,
          receiptNumber: extractedReceipt.receiptNumber ?? current.receiptNumber,
          receiptDate:
            formatDateForInput(extractedReceipt.receiptDate) || current.receiptDate,
          merchantName: extractedReceipt.merchantName ?? current.merchantName,
          merchantAddress: extractedReceipt.merchantAddress ?? current.merchantAddress,
          currency: extractedReceipt.currency ?? current.currency,
          subtotal: Number(extractedReceipt.subtotal ?? current.subtotal),
          taxAmount: Number(extractedReceipt.taxAmount ?? current.taxAmount),
          tipAmount: Number(extractedReceipt.tipAmount ?? current.tipAmount),
          discountAmount: Number(extractedReceipt.discountAmount ?? current.discountAmount),
          totalAmount: Number(extractedReceipt.totalAmount ?? current.totalAmount),
          note: extractedReceipt.note ?? current.note,
          paymentMethod:
            extractedReceipt.paymentMethod &&
            Object.values(ExpensePaymentMethod).includes(
              extractedReceipt.paymentMethod as ExpensePaymentMethod,
            )
              ? (extractedReceipt.paymentMethod as ExpensePaymentMethod)
              : current.paymentMethod,
          paymentReference: extractedReceipt.paymentReference ?? current.paymentReference,
          hasReimbursed:
            typeof extractedReceipt.hasReimbursed === 'boolean'
              ? extractedReceipt.hasReimbursed
              : current.hasReimbursed,
          category:
            extractedReceipt.category &&
            Object.values(ExpenseCategoryType).includes(
              extractedReceipt.category as ExpenseCategoryType,
            )
              ? (extractedReceipt.category as ExpenseCategoryType)
              : current.category,
          receiptImageUrl: extractedReceipt.receiptImageUrl ?? uploadedUrl,
          rawText: extractedReceipt.rawText ?? current.rawText,
          items:
            extractedReceipt.items && extractedReceipt.items.length > 0
              ? extractedReceipt.items.map((item) => ({
                  description: item.description ?? '',
                  quantity: Number(item.quantity ?? 1),
                  unitPrice: Number(item.unitPrice ?? 0),
                  taxAmount: Number(item.taxAmount ?? 0),
                  discount: Number(item.discount ?? 0),
                  lineTotal: Number(item.lineTotal ?? 0),
                }))
              : current.items,
        })
      }

      toast.success('Receipt image uploaded', {
        description: 'Fields auto-filled from Gemini AI',
        style: { color: '#22c55e' },
      })
    } catch (error) {
      console.error('Error uploading receipt image:', error)
      const isHighDemand =
        axios.isAxiosError(error) &&
        (error.response?.status === 503 ||
          (error.response?.data as { error?: { status?: string } })?.error?.status ===
            'UNAVAILABLE')
      if (isHighDemand) {
        toast.error('AI service is busy', {
          description: 'Gemini is experiencing high demand. Please try again in a moment.',
          style: { color: '#ef4444' },
        })
      } else {
        toast.error('Failed to upload image', { style: { color: '#ef4444' } })
      }
    } finally {
      setIsImageLoading(false)
      event.target.value = ''
    }
  }

  const onSubmit = async (values: ReceiptFormValues) => {
    try {
      const method = editingReceiptId ? 'put' : 'post'
      const response = await axiosInstance[method]('/api/receipts/edit', {
        receipt: {
          id: editingReceiptId ?? undefined,
          ...values,
          receiptDate: values.receiptDate
            ? new Date(values.receiptDate).toISOString()
            : undefined,
        },
      })

      if (![200, 201].includes(response.status)) {
        throw new Error(`Failed to ${editingReceiptId ? 'update' : 'save'} receipt`)
      }

      toast.success(`Receipt ${editingReceiptId ? 'updated' : 'saved'} successfully`, {
        style: { color: '#22c55e' },
      })
      setEditingReceiptId(null)
      setImagePreview('')
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error(`Error ${editingReceiptId ? 'updating' : 'saving'} receipt:`, error)
      toast.error(`Failed to ${editingReceiptId ? 'update' : 'save'} receipt`, {
        style: { color: '#ef4444' },
      })
    }
  }

  const handleToggleReimbursed = async (receiptId: string) => {
    try {
      const response = await axiosInstance.patch('/api/receipts/edit', { id: receiptId })
      if (response.status !== 200) throw new Error('Failed to toggle reimbursed')
      toast.success('Reimbursed status updated')
      router.refresh()
    } catch (error) {
      console.error('Error toggling reimbursed status:', error)
      toast.error('Failed to toggle reimbursed status')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">VVF Finance</h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingReceiptId(null)
            }}
          >
            <Button type="button" onClick={openAddReceiptDialog}>
              Add Receipt
            </Button>
            <DialogContent className="max-h-[85vh] bg-bgColor-white">
              <DialogHeader>
                <DialogTitle>
                  {editingReceiptId ? 'Edit Receipt' : 'Add Receipt'}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="max-h-[70vh] space-y-3 overflow-y-auto pr-1"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <span className="text-xs italic text-muted-foreground">
                    NOTE: Upload receipt image to auto-fill fields using Gemini AI (≈15–30 s).
                    Do not close the dialog before the process is complete.
                  </span>

                  {/* Image upload */}
                  <div className="flex flex-col items-center">
                    <label className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50">
                      {imagePreview ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={imagePreview}
                            alt="Receipt"
                            fill
                            className="rounded-lg object-cover"
                          />
                          <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-500 p-2 transition-colors hover:bg-blue-600">
                            <FiEdit2 className="h-3 w-3 text-white" />
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleImageUpload}
                              accept="image/*"
                              disabled={isImageLoading}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Add Photo</p>
                          <p className="text-xs text-gray-500">Optional</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isImageLoading}
                      />
                    </label>
                    {isImageLoading && <Loader />}
                  </div>

                  {/* Receipt header fields */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="receiptNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="receiptDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="merchantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="merchantAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subtotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtotal</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tip Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ExpensePaymentMethod).map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ExpenseCategoryType).map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Reference</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasReimbursed"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 pt-7">
                          <FormControl>
                            <input
                              id="hasReimbursed"
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel htmlFor="hasReimbursed" className="!mt-0">
                            Has Reimbursed
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rawText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raw Text</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="receiptImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Receipt Image URL (All images stored{' '}
                          <a
                            href="https://drive.google.com/drive/u/0/folders/1CC7OXATHsBxvmuFMq5wMlqs8_4kV1VUg"
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-500 underline"
                          >
                            here
                          </a>{' '}
                          in VVF Google Drive)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Receipt items */}
                  <div className="space-y-3 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Receipt Items</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append(defaultItemValues())}
                      >
                        Add Item
                      </Button>
                    </div>

                    {fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-6"
                      >
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Description</FormLabel>
                                <FormControl>
                                  <Input className="text-sm" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Qty</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" className="text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Unit Price</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" className="text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.taxAmount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tax</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" className="text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.discount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Discount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" className="text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.lineTotal`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Line Total</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" className="text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="md:col-span-6">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            Remove Item
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex pt-2">
                    <Button type="submit" disabled={isSubmitting || isImageLoading}>
                      {isSubmitting
                        ? editingReceiptId
                          ? 'Updating...'
                          : 'Saving...'
                        : editingReceiptId
                          ? 'Update Receipt'
                          : 'Submit Receipt'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Receipts</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* Receipt table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold">Receipt Table</h3>
            <ExportToExcelButton
              data={receipts.map((r) => ({
                Receipt: r.receiptNumber || r.id.slice(0, 8),
                Date: new Date(r.receiptDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
                Merchant: r.merchantName,
                Category: r.category,
                Method: r.paymentMethod,
                Currency: r.currency,
                Total: toNumber(r.totalAmount).toFixed(2),
                'Receipt Image URL': r.receiptImageUrl ?? '',
              }))}
              filename="VVF-finance-receipts"
              sheetName="Receipts"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Receipt</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Merchant</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Receipt Image URL</th>
                  <th className="min-w-[200px] px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipts.map((receipt) => {
                  const hasItems = receipt.items.length > 0
                  const isExpanded = expandedRows[receipt.id] ?? true
                  const formattedDate = new Date(receipt.receiptDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <Fragment key={receipt.id}>
                      <tr
                        className={`bg-white ${hasItems ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => hasItems && toggleRow(receipt.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {hasItems &&
                              (isExpanded ? (
                                <FiChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <FiChevronDown className="h-4 w-4 text-gray-500" />
                              ))}
                            <span>{receipt.receiptNumber || receipt.id.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{formattedDate}</td>
                        <td className="px-4 py-3">{receipt.merchantName}</td>
                        <td className="px-4 py-3">{receipt.category}</td>
                        <td className="px-4 py-3">{receipt.paymentMethod}</td>
                        <td className="px-4 py-3">
                          {receipt.currency} {toNumber(receipt.totalAmount).toFixed(2)}
                        </td>
                        <td className="max-w-[220px] break-words px-4 py-3">
                          {receipt.receiptImageUrl ? (
                            <a
                              href={receipt.receiptImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Image
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditReceipt(receipt)
                              }}
                            >
                              More & Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={receipt.hasReimbursed ? 'gray' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleReimbursed(receipt.id)
                              }}
                            >
                              {receipt.hasReimbursed ? 'Reimbursed' : 'Mark Reimbursed'}
                            </Button>
                            <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                              <ExportToExcelButton
                                data={receipt.items.map((item) => ({
                                  Item: item.description,
                                  Quantity: toNumber(item.quantity),
                                  [`Unit Price (${receipt.currency})`]: toNumber(item.unitPrice).toFixed(2),
                                  [`Tax (${receipt.currency})`]: toNumber(item.taxAmount).toFixed(2),
                                  [`Discount (${receipt.currency})`]: toNumber(item.discount).toFixed(2),
                                  [`Line Total (${receipt.currency})`]: toNumber(item.lineTotal).toFixed(2),
                                }))}
                                filename={`receipt-items-${receipt.receiptNumber || receipt.id.slice(0, 8)}-${formattedDate}`}
                                sheetName="Items"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {hasItems && isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-4 py-2">
                            <div className="ml-8 overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="px-4 py-2 text-left">Item</th>
                                    <th className="px-4 py-2 text-left">Qty</th>
                                    <th className="px-4 py-2 text-left">Unit Price</th>
                                    <th className="px-4 py-2 text-left">Tax</th>
                                    <th className="px-4 py-2 text-left">Discount</th>
                                    <th className="px-4 py-2 text-left">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {receipt.items.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="border-b border-gray-200 last:border-0"
                                    >
                                      <td className="px-4 py-2 font-medium text-gray-700">
                                        {item.description}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {toNumber(item.quantity)}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {receipt.currency} {toNumber(item.unitPrice).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {receipt.currency} {toNumber(item.taxAmount).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {receipt.currency} {toNumber(item.discount).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {receipt.currency} {toNumber(item.lineTotal).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {receipts.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">No receipts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

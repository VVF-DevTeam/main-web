'use client'

import { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi'
import { ExpenseCategoryType, ExpensePaymentMethod } from '@prisma/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Loader from '@/components/loader/Loader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { axiosInstance } from '@/lib/axios'

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

type ReceiptItemForm = {
  description: string
  quantity: number
  unitPrice: number
  taxAmount: number
  discount: number
  lineTotal: number
}

type ReceiptFormState = {
  receiptNumber: string
  receiptDate: string
  merchantName: string
  merchantAddress: string
  currency: string
  subtotal: number
  taxAmount: number
  tipAmount: number
  discountAmount: number
  totalAmount: number
  note: string
  paymentMethod: ExpensePaymentMethod
  paymentReference: string
  hasReimbursed: boolean
  category: ExpenseCategoryType
  receiptImageUrl: string
  rawText: string
  items: ReceiptItemForm[]
}

const createEmptyItem = (): ReceiptItemForm => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxAmount: 0,
  discount: 0,
  lineTotal: 0,
})

const createInitialReceiptForm = (): ReceiptFormState => ({
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
  items: [createEmptyItem()],
})

function toNumber(value: number | { toString(): string } | null | undefined) {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value.toString())
}

export default function VVFFinance({ receipts }: { receipts: ReceiptRow[] }) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [imagePreview, setImagePreview] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null)
  const [receiptForm, setReceiptForm] = useState<ReceiptFormState>(createInitialReceiptForm())

  const totalSpent = useMemo(
    () => receipts.reduce((sum, receipt) => sum + toNumber(receipt.totalAmount), 0),
    [receipts],
  )

  const toggleRow = (receiptId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [receiptId]: !prev[receiptId],
    }))
  }

  const formatDateForInput = (dateValue?: string | Date | null) => {
    if (!dateValue) return ''
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ''
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  const updateReceiptField = <K extends keyof ReceiptFormState>(
    key: K,
    value: ReceiptFormState[K],
  ) => {
    setReceiptForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateReceiptItem = <K extends keyof ReceiptItemForm>(
    index: number,
    key: K,
    value: ReceiptItemForm[K],
  ) => {
    setReceiptForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[index] = { ...nextItems[index], [key]: value }
      return { ...prev, items: nextItems }
    })
  }

  const addReceiptItem = () => {
    setReceiptForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }))
  }

  const removeReceiptItem = (index: number) => {
    setReceiptForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const openAddReceiptDialog = () => {
    setEditingReceiptId(null)
    setReceiptForm(createInitialReceiptForm())
    setImagePreview('')
    setIsDialogOpen(true)
  }

  const handleEditReceipt = (receipt: ReceiptRow) => {
    setEditingReceiptId(receipt.id)
    setReceiptForm({
      receiptNumber: receipt.receiptNumber || '',
      receiptDate: formatDateForInput(receipt.receiptDate),
      merchantName: receipt.merchantName || '',
      merchantAddress: receipt.merchantAddress || '',
      currency: receipt.currency || 'CAD',
      subtotal: toNumber(receipt.subtotal),
      taxAmount: toNumber(receipt.taxAmount),
      tipAmount: toNumber(receipt.tipAmount),
      discountAmount: toNumber(receipt.discountAmount),
      totalAmount: toNumber(receipt.totalAmount),
      note: receipt.note || '',
      paymentMethod: receipt.paymentMethod || ExpensePaymentMethod.Other,
      paymentReference: receipt.paymentReference || '',
      hasReimbursed: Boolean(receipt.hasReimbursed),
      category: receipt.category || ExpenseCategoryType.Other,
      receiptImageUrl: receipt.receiptImageUrl || '',
      rawText: receipt.rawText || '',
      items:
        receipt.items.length > 0
          ? receipt.items.map((item) => ({
            description: item.description || '',
            quantity: toNumber(item.quantity),
            unitPrice: toNumber(item.unitPrice),
            taxAmount: toNumber(item.taxAmount),
            discount: toNumber(item.discount),
            lineTotal: toNumber(item.lineTotal),
          }))
          : [createEmptyItem()],
    })
    setImagePreview(receipt.receiptImageUrl || '')
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

      if (response.status !== 200) {
        throw new Error('Failed to upload image')
      }

      const data = response.data as { url?: string }
      if (!data.url) {
        throw new Error('Upload response missing url')
      }
      const uploadedUrl = data.url

      setImagePreview(uploadedUrl)
      updateReceiptField('receiptImageUrl', uploadedUrl)

      const extractResponse = await axiosInstance.post('/api/receipts/extract', {
        imageUrl: uploadedUrl,
      })
      const extracted = extractResponse.data as {
        receipt?: Partial<ReceiptFormState> & {
          items?: Array<Partial<ReceiptItemForm>>
        }
      }
      const extractedReceipt = extracted.receipt

      if (extractedReceipt) {
        setReceiptForm((prev) => ({
          ...prev,
          receiptNumber: extractedReceipt.receiptNumber ?? prev.receiptNumber,
          receiptDate: formatDateForInput(extractedReceipt.receiptDate) || prev.receiptDate,
          merchantName: extractedReceipt.merchantName ?? prev.merchantName,
          merchantAddress: extractedReceipt.merchantAddress ?? prev.merchantAddress,
          currency: extractedReceipt.currency ?? prev.currency,
          subtotal: Number(extractedReceipt.subtotal ?? prev.subtotal),
          taxAmount: Number(extractedReceipt.taxAmount ?? prev.taxAmount),
          tipAmount: Number(extractedReceipt.tipAmount ?? prev.tipAmount),
          discountAmount: Number(extractedReceipt.discountAmount ?? prev.discountAmount),
          totalAmount: Number(extractedReceipt.totalAmount ?? prev.totalAmount),
          note: extractedReceipt.note ?? prev.note,
          paymentMethod:
            extractedReceipt.paymentMethod &&
              Object.values(ExpensePaymentMethod).includes(
                extractedReceipt.paymentMethod as ExpensePaymentMethod,
              )
              ? (extractedReceipt.paymentMethod as ExpensePaymentMethod)
              : prev.paymentMethod,
          paymentReference: extractedReceipt.paymentReference ?? prev.paymentReference,
          hasReimbursed:
            typeof extractedReceipt.hasReimbursed === 'boolean'
              ? extractedReceipt.hasReimbursed
              : prev.hasReimbursed,
          category:
            extractedReceipt.category &&
              Object.values(ExpenseCategoryType).includes(
                extractedReceipt.category as ExpenseCategoryType,
              )
              ? (extractedReceipt.category as ExpenseCategoryType)
              : prev.category,
          receiptImageUrl: extractedReceipt.receiptImageUrl ?? uploadedUrl,
          rawText: extractedReceipt.rawText ?? prev.rawText,
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
              : prev.items,
        }))
      }

      toast.success('Receipt image uploaded',
        {
          description: 'Receipt image uploaded and fields auto-filled',
          style: { color: '#22c55e' },
        }
      )
    } catch (error) {
      console.error('Error uploading receipt image:', error)
      toast.error('Failed to upload image',
        {
          description: 'Failed to upload image',
          style: { color: '#ef4444' },
        }
      )
    } finally {
      setIsImageLoading(false)
      event.target.value = ''
    }
  }

  const handleSubmitReceipt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!receiptForm.merchantName.trim()) {
      toast.error('Merchant name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const method = editingReceiptId ? 'put' : 'post'
      const response = await axiosInstance[method]('/api/receipts/edit', {
        receipt: {
          id: editingReceiptId ?? undefined,
          ...receiptForm,
          receiptDate: receiptForm.receiptDate
            ? new Date(receiptForm.receiptDate).toISOString()
            : undefined,
        },
      })

      if (![200, 201].includes(response.status)) {
        throw new Error(`Failed to ${editingReceiptId ? 'update' : 'save'} receipt`)
      }

      toast.success(`Receipt ${editingReceiptId ? 'updated' : 'saved'} successfully`,
        {
          description: `Receipt ${editingReceiptId ? 'updated' : 'saved'} successfully`,
          style: { color: '#22c55e' },
        }
      )
      setEditingReceiptId(null)
      setReceiptForm(createInitialReceiptForm())
      setImagePreview('')
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error(`Error ${editingReceiptId ? 'updating' : 'saving'} receipt:`, error)
      toast.error(`Failed to ${editingReceiptId ? 'update' : 'save'} receipt`,
        {
          description: `Failed to ${editingReceiptId ? 'update' : 'save'} receipt`,
          style: { color: '#ef4444' },
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleReimbursed = async (receiptId: string) => {
    try {
      const response = await axiosInstance.patch('/api/receipts/edit', { id: receiptId })
      if (response.status !== 200) {
        throw new Error('Failed to toggle reimbursed')
      }
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">VVF Finance</h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingReceiptId(null)
              }
            }}
          >
            <Button type="button" onClick={openAddReceiptDialog}>Add Receipt</Button>
            <DialogContent className="max-h-[85vh] bg-bgColor-white">
              <DialogHeader>
                <DialogTitle>{editingReceiptId ? 'Edit Receipt' : 'Add Receipt'}</DialogTitle>
              </DialogHeader>

              <form
                className="max-h-[70vh] space-y-3 overflow-y-auto pr-1"
                onSubmit={handleSubmitReceipt}
              >
                <span className="text-xs text-muted-foreground italic">NOTE: Upload receipt image to auto-fill fields using Gemini API (will take around 15 - 30 seconds). Do not close the dialog before the process is complete.</span>
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

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Receipt Number</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.receiptNumber}
                      onChange={(e) => updateReceiptField('receiptNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Receipt Date</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.receiptDate}
                      onChange={(e) => updateReceiptField('receiptDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Merchant Name</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.merchantName}
                      onChange={(e) => updateReceiptField('merchantName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Merchant Address</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.merchantAddress}
                      onChange={(e) => updateReceiptField('merchantAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Currency</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.currency}
                      onChange={(e) => updateReceiptField('currency', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Subtotal</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.subtotal}
                      onChange={(e) => updateReceiptField('subtotal', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tax Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.taxAmount}
                      onChange={(e) => updateReceiptField('taxAmount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tip Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.tipAmount}
                      onChange={(e) => updateReceiptField('tipAmount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Discount Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.discountAmount}
                      onChange={(e) =>
                        updateReceiptField('discountAmount', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.totalAmount}
                      onChange={(e) => updateReceiptField('totalAmount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Payment Method</label>
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.paymentMethod}
                      onChange={(e) =>
                        updateReceiptField(
                          'paymentMethod',
                          e.target.value as ExpensePaymentMethod,
                        )
                      }
                    >
                      {Object.values(ExpensePaymentMethod).map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Category</label>
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.category}
                      onChange={(e) =>
                        updateReceiptField('category', e.target.value as ExpenseCategoryType)
                      }
                    >
                      {Object.values(ExpenseCategoryType).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Payment Reference</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={receiptForm.paymentReference}
                      onChange={(e) => updateReceiptField('paymentReference', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="hasReimbursed"
                      type="checkbox"
                      checked={receiptForm.hasReimbursed}
                      onChange={(e) => updateReceiptField('hasReimbursed', e.target.checked)}
                    />
                    <label htmlFor="hasReimbursed" className="text-sm font-medium">
                      Has Reimbursed
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Note</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={3}
                    value={receiptForm.note}
                    onChange={(e) => updateReceiptField('note', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Raw Text</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={5}
                    value={receiptForm.rawText}
                    onChange={(e) => updateReceiptField('rawText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Receipt Image URL (All images are stored <span className="font-bold"><a href="https://drive.google.com/drive/u/0/folders/1CC7OXATHsBxvmuFMq5wMlqs8_4kV1VUg" target="_blank" rel="noreferrer" className="text-blue-500 underline">here</a></span> in VVF Google Drive, login with your VVF account to view)</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={receiptForm.receiptImageUrl}
                    onChange={(e) => updateReceiptField('receiptImageUrl', e.target.value)}
                  />
                </div>

                <div className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Receipt Items</p>
                    <Button type="button" variant="outline" size="sm" onClick={addReceiptItem}>
                      Add Item
                    </Button>
                  </div>

                  {receiptForm.items.map((item, index) => (
                    <div key={`receipt-item-${index}`} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-6">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Description</label>
                        <input
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.description}
                          onChange={(e) =>
                            updateReceiptItem(index, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Qty</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.quantity}
                          onChange={(e) =>
                            updateReceiptItem(index, 'quantity', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateReceiptItem(index, 'unitPrice', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Tax</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.taxAmount}
                          onChange={(e) =>
                            updateReceiptItem(index, 'taxAmount', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Discount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.discount}
                          onChange={(e) =>
                            updateReceiptItem(index, 'discount', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Line Total</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                          value={item.lineTotal}
                          onChange={(e) =>
                            updateReceiptItem(index, 'lineTotal', Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="md:col-span-6">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeReceiptItem(index)}
                          disabled={receiptForm.items.length === 1}
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
            </DialogContent>
          </Dialog>
        </div>

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

        <div className="rounded-lg border bg-white shadow-sm">
          <h3 className="border-b px-4 py-3 text-lg font-semibold">Receipt Table</h3>
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
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipts.map((receipt) => {
                  const hasItems = receipt.items.length > 0
                  const isExpanded = expandedRows[receipt.id] ?? true
                  const formattedDate = new Date(receipt.receiptDate).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    },
                  )

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
                          <div className="flex flex-wrap items-center gap-2">
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
                          </div>
                        </td>
                      </tr>

                      {hasItems && isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-4 py-2">
                            <div className="ml-8">
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
                                    <tr key={item.id} className="border-b border-gray-200 last:border-0">
                                      <td className="px-4 py-2 font-medium text-gray-700">
                                        {item.description}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">{toNumber(item.quantity)}</td>
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

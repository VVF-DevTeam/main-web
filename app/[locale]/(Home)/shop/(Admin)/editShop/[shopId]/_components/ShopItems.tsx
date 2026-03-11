'use client'
import React, { useState } from 'react'
import { Shop, ShopItem, ShopItemType, ItemStatus, ShopItemTag } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import DatePicker from '@/components/ui/DatePicker'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { axiosInstance } from '@/lib/axios'
import { AxiosError } from 'axios'
import Loader from '@/components/loader/Loader'
import Editor from '@/components/quill/Editor'
import TextPreview from '@/components/quill/TextPreview'
import formatKeyName from '@/lib/utilFunctions/keyNameUtils'
import Image from 'next/image'
import { getValidGoogleDriveImageUrl } from '@/lib/utilFunctions/gdrive-loader'

interface ShopItemsProps {
  shop: Shop & {
    shopItems?: (ShopItem & { tags?: ShopItemTag[] })[]
  }
  allTags: ShopItemTag[]
}

interface StripeShopItemDataCreate {
  success: boolean
  productId: string
  priceId: string
  subscribedPriceId: string
}

interface StripeShopItemDataEdit {
  success: boolean
  newPriceId?: string
  newSubscriptionPriceId?: string
}

// Schema for ShopItem
const createShopItemSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(ShopItemType),
    imageUrl: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          !val ||
          (typeof val === 'string' &&
            (val.trim() === '' || z.string().url().safeParse(val).success)),
        { message: 'Must be a valid URL' }
      ),
    images: z.array(z.string().url()).optional().default([]),
    limit: z.coerce.number().min(1).optional().nullable(),
    stockCount: z.coerce.number().min(0).optional().nullable(),
    lowStockThreshold: z.coerce.number().min(0).optional().nullable(),
    trackInventory: z.boolean().default(false),
    price: z.coerce.number().min(0, 'Price must be at least 0'),
    currency: z.string().default('CAD'),
    discountMemberPercent: z.coerce.number().min(0).max(100).optional().nullable(),
    // Persisted field (Prisma): ShopItem.taxPercent
    taxPercent: z.coerce.number().min(0).max(100).optional().nullable(),
    // UI-only toggle: controls whether taxPercent is enabled
    taxable: z.boolean().default(false),
    minQuantity: z.coerce.number().min(1).optional().nullable(),
    maxQuantity: z.coerce.number().min(1).optional().nullable(),
    status: z.nativeEnum(ItemStatus).default(ItemStatus.AVAILABLE),
    validFrom: z.date().optional().nullable(),
    validTo: z.date().optional().nullable(),
    isFeatured: z.boolean().default(false),
    sortOrder: z.coerce.number().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    stripeProductId: z.string().optional(),
    stripePriceId: z.string().optional(),
    subscribedStripePriceId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If taxable is checked, taxPercent must be provided; otherwise taxPercent must be null/undefined
      if (data.taxable) {
        return data.taxPercent !== null && data.taxPercent !== undefined
      }
      return data.taxPercent === null || data.taxPercent === undefined
    },
    {
      message: 'Tax percent is required when item is taxable',
      path: ['taxPercent'],
    }
  )
  .refine(
    (data) => {
      // If maxQuantity is provided, it must be >= minQuantity
      if (
        data.maxQuantity !== null &&
        data.maxQuantity !== undefined &&
        data.minQuantity !== null &&
        data.minQuantity !== undefined
      ) {
        return data.maxQuantity >= data.minQuantity
      }
      return true
    },
    {
      message: 'Max quantity must be greater than or equal to min quantity',
      path: ['maxQuantity'],
    }
  )
  .refine(
    (data) => {
      // If trackInventory is true, stockCount should be provided
      if (data.trackInventory && (data.stockCount === null || data.stockCount === undefined)) {
        return false
      }
      return true
    },
    {
      message: 'Stock count is required when tracking inventory',
      path: ['stockCount'],
    }
  )

type ShopItemFormData = z.infer<typeof createShopItemSchema>

// Normalize a tag string to "Camel case" (Title Case words)
const formatTagLabel = (value: string) => {
  return value
    .toLowerCase()
    .split(' ')
    .filter((part) => part.trim() !== '')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const ShopItems = ({ shop, allTags }: ShopItemsProps) => {
  const router = useRouter()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageInputs, setImageInputs] = useState<string[]>([''])
  const [tagInputs, setTagInputs] = useState<string[]>([''])
  const [tagIds, setTagIds] = useState<(string | null)[]>([null])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
  const currentDateTime = getCurrentDateTime()
  const items = shop.shopItems || []

  // Form for ShopItem
  const itemForm = useForm<ShopItemFormData>({
    resolver: zodResolver(createShopItemSchema),
    mode: 'all',
    defaultValues: {
      title: '',
      description: null,
      type: ShopItemType.General,
      imageUrl: null,
      images: [],
      limit: null,
      stockCount: null,
      lowStockThreshold: null,
      trackInventory: false,
      price: 0,
      currency: 'CAD',
      discountMemberPercent: null,
      taxPercent: null,
      taxable: false,
      minQuantity: 1,
      maxQuantity: null,
      status: ItemStatus.AVAILABLE,
      validFrom: null,
      validTo: null,
      isFeatured: false,
      sortOrder: null,
      tags: [],
    },
  })

  const resetItemForm = () => {
    itemForm.reset({
      title: '',
      description: null,
      type: ShopItemType.General,
      imageUrl: null,
      images: [],
      limit: null,
      stockCount: null,
      lowStockThreshold: null,
      trackInventory: false,
      price: 0,
      currency: 'CAD',
      discountMemberPercent: null,
      taxPercent: null,
      taxable: false,
      minQuantity: 1,
      maxQuantity: null,
      status: ItemStatus.AVAILABLE,
      validFrom: null,
      validTo: null,
      isFeatured: false,
      sortOrder: null,
      tags: [],
    })
    setEditingItemId(null)
    setIsAddingNew(false)
    setImageInputs([''])
    setTagInputs([''])
    setTagIds([null])
  }

  const handleAddItemClick = () => {
    resetItemForm()
    setIsAddingNew(true)
  }

  const handleMainImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true)
      const file = event.target.files[0]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axiosInstance.post(
          '/api/shops/items/images',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        if (response.status === 200) {
          itemForm.setValue('imageUrl', getValidGoogleDriveImageUrl(response.data.url), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
          toast.success('Image uploaded successfully', {
            style: { color: '#22c55e' },
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
          })
        } else {
          toast.error('Failed to upload image', {
            style: { color: '#ef4444' },
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
          })
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image', {
          style: { color: '#ef4444' },
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const loadItemIntoForm = (item: ShopItem & { tags?: ShopItemTag[] }) => {
    itemForm.reset({
      title: item.title,
      description: item.description ?? null,
      type: item.type,
      imageUrl: item.imageUrl ?? null,
      images: item.images || [],
      limit: item.limit ?? null,
      stockCount: item.stockCount ?? null,
      lowStockThreshold: item.lowStockThreshold ?? null,
      trackInventory: item.trackInventory,
      price: Number(item.price),
      currency: item.currency,
      discountMemberPercent: item.discountMemberPercent ?? null,
      taxPercent: item.taxPercent ?? null,
      taxable: item.taxPercent !== null && item.taxPercent !== undefined,
      minQuantity: item.minQuantity ?? 1,
      maxQuantity: item.maxQuantity ?? null,
      status: item.status,
      validFrom: item.validFrom ? new Date(item.validFrom) : null,
      validTo: item.validTo ? new Date(item.validTo) : null,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder ?? null,
      // Map related ShopItemTag objects to their titles for the form
      tags: (item.tags || []).map((tag) => tag.title),
      stripeProductId: item.stripeProductId,
      stripePriceId: item.stripePriceId,
      subscribedStripePriceId: item.subscribedStripePriceId ?? undefined,
    })
    setImageInputs(item.images && item.images.length > 0 ? [...item.images, ''] : [''])
    // Pre-fill tag inputs and ids with existing tags
    const tagTitles = (item.tags || []).map((tag) => tag.title)
    const tagIdList = (item.tags || []).map((tag) => tag.id)
    setTagInputs(tagTitles.length > 0 ? [...tagTitles, ''] : [''])
    setTagIds(tagIdList.length > 0 ? [...tagIdList, null] : [null])
    setEditingItemId(item.id)
    setIsAddingNew(false)
  }

  // Handle ShopItem submission
  const onItemSubmit = async (values: ShopItemFormData) => {
    try {
      setIsLoading(true)
      const itemTitle = `${shop.title} - ${values.type} Shop Item`
      const shopUrl = shop.slug ? `https://www.vietvibe.org/en/shop/${shop.slug}` : ''

      // Process images array - remove empty strings
      const processedImages = imageInputs.filter((img) => img.trim() !== '')

      // Process tags array - split into existing tag ids and new tag titles
      const existingTagIds: string[] = []
      const newTagTitles: string[] = []

      tagInputs.forEach((rawTitle, index) => {
        const title = rawTitle.trim()
        if (!title) return
        const id = tagIds[index]
        if (id) {
          existingTagIds.push(id)
        } else {
          newTagTitles.push(title)
        }
      })

      // Auto-generate SKU from shop title and item title
      const shopTitleTrimmed = shop.title.trim()
      const itemTitleTrimmed = values.title.trim()
      const generatedSku = formatKeyName(`${shopTitleTrimmed} ${itemTitleTrimmed}`)

      let stripeProductId = values.stripeProductId
      let stripePriceId = values.stripePriceId
      let subscribedStripePriceId = values.subscribedStripePriceId

      // Create or update Stripe product and price
      if (editingItemId) {
        // Updating existing item
        if (!stripeProductId || !stripePriceId) {
          return toast.error('Missing Stripe product or price ID', {
            description: currentDateTime,
            style: { color: '#ef4444' },
          })
        }

        // Check if price or discount changed
        const existingItem = items.find((i) => i.id === editingItemId)
        const priceChanged =
          existingItem && Number(existingItem.price) !== values.price
        const discountChanged =
          existingItem &&
          (existingItem.discountMemberPercent ?? null) !==
          (values.discountMemberPercent ?? null)

        // Update Stripe if price or discount changed
        if (priceChanged || discountChanged) {
          const { data } = await axiosInstance.put<StripeShopItemDataEdit>(
            '/api/payment/stripe-prices/shop-items',
            {
              shopId: shop.id,
              shopUrl,
              title: itemTitle,
              price: values.price,
              stripeProductId,
              stripePriceId,
              stripeSubscriptionPriceId: subscribedStripePriceId,
              currency: values.currency,
              discountMemberPercent: values.discountMemberPercent ?? null,
            }
          )
          // Update price IDs if new ones were created
          if (data.newPriceId) {
            stripePriceId = data.newPriceId
          }
          if (data.newSubscriptionPriceId) {
            subscribedStripePriceId = data.newSubscriptionPriceId
          }
        }
      } else {
        // Creating new item
        const { data } = await axiosInstance.post<StripeShopItemDataCreate>(
          '/api/payment/stripe-prices/shop-items',
          {
            shopId: shop.id,
            shopUrl,
            title: itemTitle,
            price: values.price,
            currency: values.currency,
            discountMemberPercent: values.discountMemberPercent ?? null,
          }
        )
        stripeProductId = data.productId
        stripePriceId = data.priceId
        subscribedStripePriceId = data.subscribedPriceId
      }

      // Create or update item in database
      const itemData = {
        shopIds: [shop.id], // Many-to-many relation
        title: values.title,
        description: values.description ?? null,
        sku: generatedSku, // Auto-generated from shop title + item title
        type: values.type,
        imageUrl: values.imageUrl ?? null,
        images: processedImages,
        limit: values.limit ?? null,
        stockCount: values.trackInventory ? (values.stockCount ?? null) : null,
        lowStockThreshold: values.trackInventory ? (values.lowStockThreshold ?? null) : null,
        trackInventory: values.trackInventory,
        price: values.price,
        currency: values.currency,
        discountMemberPercent: values.discountMemberPercent ?? null,
        taxPercent: values.taxable ? (values.taxPercent ?? null) : null,
        minQuantity: values.minQuantity ?? null,
        maxQuantity: values.maxQuantity ?? null,
        status: values.status,
        validFrom: values.validFrom ? values.validFrom.toISOString() : null,
        validTo: values.validTo ? values.validTo.toISOString() : null,
        isFeatured: values.isFeatured,
        sortOrder: values.sortOrder ?? null,
        existingTagIds,
        newTagTitles,
        stripeProductId,
        stripePriceId,
        subscribedStripePriceId,
      }

      if (editingItemId) {
        // Update item in database
        await axiosInstance.put('/api/shops/items', {
          id: editingItemId,
          ...itemData,
        })

        toast.success('Shop item updated successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' },
        })
      } else {
        const response = await axiosInstance.post('/api/shops/items', itemData)
        const createdItemId = response.data.id

        // Update Stripe product metadata with itemId after item creation
        await axiosInstance.put('/api/payment/stripe-prices/shop-items', {
          shopId: shop.id,
          shopUrl,
          title: itemTitle,
          stripeProductId,
          itemId: createdItemId,
        })
        toast.success('Shop item created successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' },
        })
      }

      resetItemForm()
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        let errorMessage = 'An unknown error occurred'
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (
            typeof error.response.data === 'object' &&
            error.response.data !== null
          ) {
            errorMessage =
              (error.response.data as { message?: string }).message ||
              JSON.stringify(error.response.data)
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else if (error instanceof Error) {
        toast.error(error.message || 'Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Error</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this shop item? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      await axiosInstance.delete('/api/shops/items', {
        data: { id: itemId },
      })
      toast.success('Shop item deleted successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: { color: '#22c55e' },
      })
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        let errorMessage = 'An unknown error occurred'
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (
            typeof error.response.data === 'object' &&
            error.response.data !== null
          ) {
            errorMessage =
              (error.response.data as { message?: string }).message ||
              JSON.stringify(error.response.data)
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        toast.error('Failed to delete shop item', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete shop item', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Error</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const { isSubmitting: isItemSubmitting, isValid: isItemValid } =
    itemForm.formState
  const isEditingItem = editingItemId !== null || isAddingNew

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
        {/* ShopItems section */}
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Shop Items</h1>
            <div className="flex gap-x-2">
              {!isEditingItem && (
                <button
                  onClick={handleAddItemClick}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center gap-x-2 text-sm font-semibold text-[#C54B3E] transition-all hover:text-slate-700'
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              )}
            </div>
          </div>

          <p className="text-sm italic text-muted-foreground text-slate-500">
            NOTE: Item will be hidden after the Valid To date.
          </p>

          {/* Item List */}
          {!isEditingItem && items.length > 0 && (
            <div className="flex flex-col gap-y-4">
              {items.map((item) => {
                const stockInfo = item.trackInventory
                  ? `Stock: ${item.stockCount ?? 'N/A'}`
                  : 'No inventory tracking'
                const itemImageUrl = item.imageUrl
                  ? getValidGoogleDriveImageUrl(item.imageUrl) || item.imageUrl
                  : null
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-md border bg-white p-4"
                  >
                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-y-1">
                      {/* Tags row on top of card content, similar to ShopBrowsePanel */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-[10px] bg-gray-100 text-gray-700"
                            >
                              {tag.title}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="font-semibold">
                        {item.title} - ${Number(item.price).toFixed(2)}{' '}
                        {item.currency}
                        {item.isFeatured && (
                          <span className="ml-2 text-xs font-normal text-green-600">
                            (Featured)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Type: {item.type} | Status: {item.status} | {stockInfo}
                        {item.limit != null && item.limit > 0 && (
                          <> | Limit: {item.limit}</>
                        )}
                        {item.discountMemberPercent !== null && (
                          <> | Discount for Members: {item.discountMemberPercent}%</>
                        )}
                      </div>
                      {item.validFrom && item.validTo && (
                        <div className="text-xs text-muted-foreground">
                          Valid: {new Date(item.validFrom).toLocaleDateString()}{' '}
                          - {new Date(item.validTo).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Background Image - Middle */}
                    {itemImageUrl && (
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={itemImageUrl}
                          alt={`${item.title} item background`}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-x-2">
                      <button
                        onClick={() => loadItemIntoForm(item)}
                        disabled={isLoading}
                        className="rounded p-2 hover:bg-gray-100"
                        title="Edit item"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isLoading}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!isEditingItem && items.length === 0 && (
            <p className="text-sm italic text-muted-foreground text-slate-500">
              No items added yet. Click &quot;Add Item&quot; to create one.
            </p>
          )}

          {/* Add/Edit Item Form */}
          {isEditingItem && (
            <div className="rounded-md border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingItemId ? 'Edit Shop Item' : 'Add New Shop Item'}
                </h3>
                <button
                  onClick={resetItemForm}
                  disabled={isLoading}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Form {...itemForm}>
                <form
                  onSubmit={itemForm.handleSubmit(onItemSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Title */}
                    <FormField
                      control={itemForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g., VVF T-Shirt"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type */}
                    <FormField
                      control={itemForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value as ShopItemType)
                            }
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ShopItemType.General}>
                                General
                              </SelectItem>
                              <SelectItem value={ShopItemType.Limit}>
                                Limit
                              </SelectItem>
                              <SelectItem value={ShopItemType.Discount}>
                                Discount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={itemForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value as ItemStatus)
                            }
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ItemStatus.AVAILABLE}>
                                Available
                              </SelectItem>
                              <SelectItem value={ItemStatus.OUT_OF_STOCK}>
                                Out of Stock
                              </SelectItem>
                              <SelectItem value={ItemStatus.DISCONTINUED}>
                                Discontinued
                              </SelectItem>
                              <SelectItem value={ItemStatus.COMING_SOON}>
                                Coming Soon
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Price */}
                    <FormField
                      control={itemForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 25.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currency */}
                    <FormField
                      control={itemForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="VND">VND</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Discount Member Percent */}
                    <FormField
                      control={itemForm.control}
                      name="discountMemberPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Discount Percentage for Members (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              placeholder="e.g., 10"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(
                                  value === '' ? null : Number(value)
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Taxable + Tax Percent (combined field) */}
                    <FormField
                      control={itemForm.control}
                      name="taxable"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-3 rounded-md border p-4">
                          <div className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Taxable</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  const isChecked = checked === true
                                  field.onChange(isChecked)
                                  if (!isChecked) {
                                    itemForm.setValue('taxPercent', null, {
                                      shouldDirty: true,
                                      shouldTouch: true,
                                      shouldValidate: true,
                                    })
                                  }
                                }}
                              />
                            </FormControl>
                          </div>

                          {/* Tax Percent input inside the same card */}
                          {itemForm.watch('taxable') && (<FormField
                            control={itemForm.control}
                            name="taxPercent"
                            render={({ field: taxField }) => (
                              <div className="flex w-full flex-col space-y-1">
                                <FormLabel className="text-sm">
                                  Tax Percent{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    placeholder="e.g., 5"
                                    disabled={!itemForm.watch('taxable')}
                                    {...taxField}
                                    value={taxField.value ?? ''}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      taxField.onChange(
                                        value === '' ? null : Number(value)
                                      )
                                    }}
                                  />
                                </FormControl>
                                <FormDescription className="text-[11px] italic">
                                  Enter a percentage from 0 to 100. Please research the tax rate for your items online first.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            )}
                          />)}

                          <FormDescription className="italic">
                            Check if sales tax should be applied to this item.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Limit */}
                    <FormField
                      control={itemForm.control}
                      name="limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limit (Optional, maximum number of items that can be purchased)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="e.g., 100"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(
                                  value === '' ? null : Number(value)
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Min Quantity */}
                    <FormField
                      control={itemForm.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Quantity (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="e.g., 1"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(
                                  value === '' ? null : Number(value)
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Max Quantity */}
                    <FormField
                      control={itemForm.control}
                      name="maxQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Quantity (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="e.g., 10"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(
                                  value === '' ? null : Number(value)
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sort Order */}
                    {/* <FormField
                      control={itemForm.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Order (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="e.g., 1"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(
                                  value === '' ? null : Number(value)
                                )
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            Lower numbers appear first
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* Track Inventory */}
                    <FormField
                      control={itemForm.control}
                      name="trackInventory"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start space-y-1 rounded-md border p-4">
                          <div className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Track Inventory</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="italic">
                            (Enable inventory tracking for this item - capacity and alert for low stock)
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Stock Count - shown when trackInventory is true */}
                    {itemForm.watch('trackInventory') && (
                      <>
                        <FormField
                          control={itemForm.control}
                          name="stockCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Count (Actual number of items in stock)<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  placeholder="e.g., 50"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(
                                      value === '' ? null : Number(value)
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="lowStockThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Low Stock Threshold</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  placeholder="e.g., 10"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(
                                      value === '' ? null : Number(value)
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormDescription className="text-[11px]">
                                Alert when stock falls below this number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Is Featured */}
                    <FormField
                      control={itemForm.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start space-y-1 rounded-md border p-4">
                          <div className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Featured Item</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="italic">
                            (Highlight this item on the shop page)
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Valid From Date */}
                    <FormField
                      control={itemForm.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Valid From (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex w-full max-w-full flex-col gap-2">
                              <div className="w-full max-w-full">
                                <DatePicker
                                  value={field.value ?? undefined}
                                  onChange={(date) => {
                                    field.onChange(date ?? null)
                                  }}
                                />
                              </div>
                              {field.value && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(null)}
                                  className="self-start text-xs text-red-600 hover:underline"
                                >
                                  Clear date
                                </button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Valid To Date */}
                    <FormField
                      control={itemForm.control}
                      name="validTo"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Valid To (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex w-full max-w-full flex-col gap-2">
                              <div className="w-full max-w-full">
                                <DatePicker
                                  value={field.value ?? undefined}
                                  onChange={(date) => {
                                    field.onChange(date ?? null)
                                  }}
                                />
                              </div>
                              {field.value && (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(null)}
                                  className="self-start text-xs text-red-600 hover:underline"
                                >
                                  Clear date
                                </button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image URL */}
                    <FormField
                      control={itemForm.control}
                      name="imageUrl"
                      render={({ field }) => {
                        const validUrl = getValidGoogleDriveImageUrl(
                          field.value || ''
                        )
                        return (
                          <FormItem>
                            <FormLabel>Main Image URL (Optional)</FormLabel>
                            <FormDescription>
                              (Please use the button to upload new image. An URL will be generated automatically. You can reuse the same image link for multiple items.)
                            </FormDescription>
                            <FormControl>
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Input
                                    type="url"
                                    placeholder="https://drive.google.com/thumbnail?id=FILE_ID"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      field.onChange(
                                        value === '' ? null : value
                                      )
                                    }}
                                    onBlur={(e) => {
                                      const raw = e.target.value || ''
                                      const normalized =
                                        getValidGoogleDriveImageUrl(raw)
                                      if (
                                        normalized &&
                                        normalized !== field.value
                                      ) {
                                        field.onChange(normalized)
                                      }
                                      field.onBlur()
                                    }}
                                  />
                                  {field.value && (
                                    <div className="relative aspect-video max-w-xl">
                                      {validUrl ? (
                                        <Image
                                          fill
                                          src={validUrl}
                                          alt="Item main image preview"
                                          className="rounded-md object-cover"
                                        />
                                      ) : (
                                        <p className="text-xs text-textColor-red">
                                          Invalid Google Drive image URL
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                    Upload Image File
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleMainImageUpload}
                                      disabled={isLoading}
                                    />
                                  </label>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>

                  {/* Description - Full Width */}
                  <FormField
                    control={itemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Editor
                              onChange={(value) => field.onChange(value || null)}
                              value={field.value || ''}
                            />
                            <div className="rounded-md border bg-slate-50 p-2">
                              <TextPreview value={field.value || ''} />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Multiple Images */}
                  <div className="space-y-2">
                    <FormLabel>Additional Images (Optional)</FormLabel>
                    {imageInputs.map((img, index) => (
                      <div key={index} className="flex flex-1 flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder={`Image ${index + 1} URL`}
                            value={img}
                            onChange={(e) => {
                              const newInputs = [...imageInputs]
                              newInputs[index] = e.target.value
                              setImageInputs(newInputs)
                              itemForm.setValue(
                                'images',
                                newInputs.filter((i) => i.trim() !== '')
                              )
                            }}
                            onBlur={(e) => {
                              const raw = e.target.value || ''
                              const normalized =
                                getValidGoogleDriveImageUrl(raw) || raw
                              if (normalized !== img) {
                                const newInputs = [...imageInputs]
                                newInputs[index] = normalized
                                setImageInputs(newInputs)
                                itemForm.setValue(
                                  'images',
                                  newInputs.filter(
                                    (i) => i.trim() !== ''
                                  )
                                )
                              }
                            }}
                          />
                          {index === imageInputs.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setImageInputs([...imageInputs, ''])
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          {imageInputs.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newInputs = imageInputs.filter(
                                  (_, i) => i !== index
                                )
                                setImageInputs(newInputs)
                                itemForm.setValue(
                                  'images',
                                  newInputs.filter(
                                    (i) => i.trim() !== ''
                                  )
                                )
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {img.trim() !== '' && (
                          <div className="relative aspect-video max-w-xl">
                            {getValidGoogleDriveImageUrl(img) ? (
                              <Image
                                fill
                                src={
                                  getValidGoogleDriveImageUrl(img) || img
                                }
                                alt={`Additional image ${index + 1} preview`}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <p className="text-xs text-textColor-red">
                                Invalid Google Drive image URL
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormDescription>Please reuse existing tags by clicking on the tag name if possible.</FormDescription>
                    {tagInputs.map((tag, index) => (
                      <div key={index} className="flex flex-1 flex-col gap-1">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder={`Tag ${index + 1}`}
                            value={tag}
                            onChange={(e) => {
                              const value = e.target.value
                              const newInputs = [...tagInputs]
                              const newIds = [...tagIds]
                              newInputs[index] = value
                              // When user types, clear any previously selected tag id
                              newIds[index] = null
                              setTagInputs(newInputs)
                              setTagIds(newIds)
                              itemForm.setValue(
                                'tags',
                                newInputs
                                  .map((t) => t.trim())
                                  .filter((t) => t !== '')
                              )
                            }}
                            onFocus={() => setActiveTagIndex(index)}
                            onBlur={(e) => {
                              // Format tag to Camel case / Title Case on blur
                              const raw = e.target.value
                              const formatted = formatTagLabel(raw)

                              const newInputs = [...tagInputs]
                              newInputs[index] = formatted
                              setTagInputs(newInputs)

                              itemForm.setValue(
                                'tags',
                                newInputs
                                  .map((t) => t.trim())
                                  .filter((t) => t !== '')
                              )

                              setActiveTagIndex((current) =>
                                current === index ? null : current
                              )
                            }}
                          />
                          {index === tagInputs.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setTagInputs([...tagInputs, ''])
                                setTagIds([...tagIds, null])
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          {tagInputs.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newInputs = tagInputs.filter((_, i) => i !== index)
                                const newIds = tagIds.filter((_, i) => i !== index)
                                setTagInputs(newInputs)
                                setTagIds(newIds)
                                itemForm.setValue(
                                  'tags',
                                  newInputs
                                    .map((t) => t.trim())
                                    .filter((t) => t !== '')
                                )
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Suggestions dropdown */}
                        {activeTagIndex === index && (
                          <div className="max-h-40 w-full overflow-y-auto rounded-md border bg-white text-sm shadow-sm">
                            {allTags
                              .filter((t) => {
                                const query = tag.toLowerCase().trim()
                                const matchesQuery =
                                  query === '' ||
                                  t.title.toLowerCase().includes(query)
                                // avoid showing tags already selected by id in other rows
                                const alreadySelected = tagIds.includes(t.id)
                                return matchesQuery && !alreadySelected
                              })
                              .slice(0, 10)
                              .map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  className="flex w-full items-center justify-between px-2 py-1 text-left hover:bg-gray-100"
                                  // Use onMouseDown so selection happens before the input loses focus
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    const newInputs = [...tagInputs]
                                    const newIds = [...tagIds]
                                    newInputs[index] = t.title
                                    newIds[index] = t.id
                                    setTagInputs(newInputs)
                                    setTagIds(newIds)
                                    itemForm.setValue(
                                      'tags',
                                      newInputs
                                        .map((title) => title.trim())
                                        .filter((title) => title !== '')
                                    )
                                    setActiveTagIndex(null)
                                  }}
                                >
                                  <span>{t.title}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-x-2">
                    <Button
                      type="submit"
                      disabled={isItemSubmitting || !isItemValid || isLoading}
                    >
                      {editingItemId ? 'Update Item' : 'Create Item'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetItemForm}
                      disabled={isItemSubmitting || isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </>
      </div>
    </>
  )
}

export default ShopItems


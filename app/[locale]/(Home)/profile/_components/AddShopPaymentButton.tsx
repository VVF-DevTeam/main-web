'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { getUsersSimple } from '@/lib/actions/user/getAllUsersSimple'
import { UserInfoProps, UserInfoSimpleProps } from '@/lib/types/userInfo'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { addShopPayment } from '@/lib/actions/payment/addShopPayment'
import { getAllPublishedShop, getShopsOfShopOwner, getShopById } from '@/lib/actions/shop/getShop'

const addShopPaymentSchema = z
  .object({
    shopId: z.string().min(1, 'Shop is required'),
    shopItemId: z.string().optional(),
    userId: z.string().optional(),
    guestName: z.string().optional(),
    guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    guestPhone: z.string().optional(),
    pricePaid: z.number().optional(),
    quantity: z.number().min(1, 'Quantity must be greater than 0'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  })
  .refine(
    (data) => {
      const hasUserId = data.userId && data.userId.trim() !== '' && data.userId !== 'none-user'
      const hasGuestInfo = data.guestName && data.guestName.trim() !== '' && data.guestEmail && data.guestEmail.trim() !== ''
      return hasUserId || hasGuestInfo
    },
    {
      message: 'Either select an existing user or provide guest name and guest email',
      path: ['userId'],
    }
  )
  .refine(
    (data) => {
      const hasItem = data.shopItemId && data.shopItemId.trim() !== ''
      const hasPrice = data.pricePaid && data.pricePaid > 0
      return hasItem || hasPrice
    },
    {
      message: 'Either select a shop item or enter a price manually',
      path: ['pricePaid'],
    }
  )

type AddShopPaymentFormValues = z.infer<typeof addShopPaymentSchema>

type ShopOption = { id: string; title: string }
type ShopItemOption = { id: string; title: string; price: number }

const AddShopPaymentModal = ({
  form,
  shops,
  users,
  filteredUsers,
  setFilteredUsers,
  searchTerm,
  setSearchTerm,
  setShowModal,
  onSubmit,
  shopItems,
  setShopItems,
  preSelectedShopId,
}: {
  form: UseFormReturn<AddShopPaymentFormValues>
  shops: ShopOption[]
  users: UserInfoSimpleProps[]
  filteredUsers: UserInfoSimpleProps[]
  setFilteredUsers: (users: UserInfoSimpleProps[]) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  setShowModal: (show: boolean) => void
  onSubmit: (data: AddShopPaymentFormValues) => void
  shopItems: ShopItemOption[]
  setShopItems: (items: ShopItemOption[]) => void
  preSelectedShopId?: string
}) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setShowModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleOverlayClick}>
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Shop Payment Record</h2>
          <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
        </div>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
              <FormField
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop{preSelectedShopId && ' (Fixed)'}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={async (value) => {
                          field.onChange(value)
                          form.setValue('shopItemId', '')
                          form.setValue('pricePaid', 0)
                          try {
                            const shop = await getShopById(value)
                            const items = (shop?.shopItems || []).map((item) => ({
                              id: item.id,
                              title: item.title,
                              price: Number(item.price),
                            }))
                            setShopItems(items)
                          } catch {
                            setShopItems([])
                          }
                        }}
                        disabled={!!preSelectedShopId}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select a shop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Item (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          const item = shopItems.find((i) => i.id === value)
                          if (item) form.setValue('pricePaid', item.price * (form.watch('quantity') || 1))
                        }}
                        disabled={!form.watch('shopId') || shopItems.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select an item (or enter price manually)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shopItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.title} - ${item.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Paid (CAD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!!form.watch('shopItemId')}
                        placeholder={form.watch('shopItemId') ? 'Calculated from item' : 'Enter price manually'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link with existing User (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!!form.watch('guestName') || !!form.watch('guestEmail')}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none-user">None</SelectItem>
                          <div className="pb-2">
                            <Input
                              type="search"
                              autoComplete="off"
                              placeholder="Search for username"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onKeyDown={async (e) => {
                                e.stopPropagation()
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const filtered = await getUsersSimple({
                                    count: 15,
                                    nameSortString: searchTerm || undefined,
                                  })
                                  setFilteredUsers(filtered)
                                }
                              }}
                            />
                          </div>
                          {filteredUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="guestName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter guest name" disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="guestEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter guest email" disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="guestPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter guest phone" disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => {
                        const qty = Number(e.target.value)
                        field.onChange(qty)
                        const item = shopItems.find((i) => i.id === form.watch('shopItemId'))
                        if (item) form.setValue('pricePaid', item.price * qty)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETF">E-transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit">Add Shop Payment</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

interface AddShopPaymentButtonProps {
  user: UserInfoProps
  preSelectedShopId?: string
  onPaymentAdded?: () => void | Promise<void>
}

export default function AddShopPaymentButton({
  user,
  preSelectedShopId,
  onPaymentAdded,
}: AddShopPaymentButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [shops, setShops] = useState<ShopOption[]>([])
  const [users, setUsers] = useState<UserInfoSimpleProps[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInfoSimpleProps[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [shopItems, setShopItems] = useState<ShopItemOption[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role.includes('ADMIN') || user.role.includes('SUPERADMIN')) {
          const published = await getAllPublishedShop()
          setShops(published)
        } else if (user.role.includes('SHOPOWNER')) {
          const own = await getShopsOfShopOwner(user.id)
          setShops(own)
        }

        const allUsers = await getUsersSimple({ count: 15 })
        setUsers(allUsers)
        setFilteredUsers(allUsers)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [user.id, user.role])

  const form = useForm<AddShopPaymentFormValues>({
    resolver: zodResolver(addShopPaymentSchema),
    defaultValues: {
      shopId: preSelectedShopId || '',
      shopItemId: '',
      userId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      pricePaid: 0,
      quantity: 1,
      paymentMethod: '',
    },
  })

  useEffect(() => {
    if (!preSelectedShopId) return
    const loadItems = async () => {
      try {
        const shop = await getShopById(preSelectedShopId)
        const items = (shop?.shopItems || []).map((item) => ({
          id: item.id,
          title: item.title,
          price: Number(item.price),
        }))
        setShopItems(items)
      } catch {
        setShopItems([])
      }
    }
    loadItems()
  }, [preSelectedShopId])

  const onSubmit = async (data: AddShopPaymentFormValues) => {
    const submitData = {
      ...data,
      shopId: data.shopId,
      userId: data.userId === 'none-user' ? undefined : data.userId,
      shopItemId: data.shopItemId || undefined,
      pricePaid: data.pricePaid || 0,
    }

    const { success } = await addShopPayment(submitData)
    if (success) {
      toast.success('Success', {
        description: 'Shop payment added successfully',
        style: { color: '#22c55e' },
      })
      setShowModal(false)
      form.reset({
        shopId: preSelectedShopId || '',
        shopItemId: '',
        userId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        pricePaid: 0,
        quantity: 1,
        paymentMethod: '',
      })
      if (onPaymentAdded) {
        await onPaymentAdded()
      } else {
        router.refresh()
      }
    } else {
      toast.error('Error', {
        description: 'Something went wrong',
        style: { color: '#ef4444' },
      })
    }
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Add Shop Payment</Button>
      {showModal && (
        <AddShopPaymentModal
          form={form}
          shops={shops}
          users={users}
          filteredUsers={filteredUsers}
          setFilteredUsers={setFilteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowModal={setShowModal}
          onSubmit={onSubmit}
          shopItems={shopItems}
          setShopItems={setShopItems}
          preSelectedShopId={preSelectedShopId}
        />
      )}
    </>
  )
}

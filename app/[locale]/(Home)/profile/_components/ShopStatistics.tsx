'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { FiCopy, FiEdit } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import {
  getAllPublishedShop,
  getShopsOfShopOwner,
} from '@/lib/actions/shop/getShop'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getShopPayments } from '../../../../../lib/actions/payment/getShopPayments'
import { PaymentMethod, PaymentType } from '@prisma/client'
import { UserInfoProps } from '@/lib/types/userInfo'
import AddShopPaymentButton from './AddShopPaymentButton'

interface ShopStatisticsProps {
  user: UserInfoProps
  locale: string
}

interface ShopOption {
  id: string
  title: string
}

interface ShopPayment {
  id: string
  createdAt: Date
  pricePaid: number
  quantity: number
  method: PaymentMethod
  type: PaymentType
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  user: {
    name: string | null
    email: string
    phone: string | null
  } | null
  shop: {
    id: string
    title: string
  } | null
  shopItem: {
    id: string
    title: string
  } | null
}

export default function ShopStatistics({ user, locale }: ShopStatisticsProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const router = useRouter()
  const searchParams = useSearchParams()

  const [shops, setShops] = useState<ShopOption[]>([])
  const [filteredShops, setFilteredShops] = useState<ShopOption[]>([])
  const [shopSearchTerm, setShopSearchTerm] = useState('')
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [shopPayments, setShopPayments] = useState<ShopPayment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const shopIdFromUrl = searchParams.get('shopId')
    if (shopIdFromUrl) {
      setSelectedShopId(shopIdFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchShops = async () => {
      try {
        if (user.role.includes('ADMIN') || user.role.includes('SUPERADMIN')) {
          const publishedShops = await getAllPublishedShop()
          setShops(publishedShops)
          setFilteredShops(publishedShops)
        } else if (user.role.includes('SHOPOWNER')) {
          const shopsOfOwner = await getShopsOfShopOwner(user.id)
          setShops(shopsOfOwner)
          setFilteredShops(shopsOfOwner)
        }
      } catch (error) {
        console.error('Error fetching shops:', error)
      }
    }
    fetchShops()
  }, [user.id, user.role])

  const reloadShopPayments = useCallback(async () => {
    if (!selectedShopId) return
    setLoading(true)
    try {
      const selectedShopPayments = await getShopPayments(selectedShopId)
      setShopPayments(selectedShopPayments)
    } catch (error) {
      console.error('Error fetching shop payments:', error)
      toast.error('Failed to load shop payments')
    } finally {
      setLoading(false)
    }
  }, [selectedShopId])

  useEffect(() => {
    if (selectedShopId) {
      reloadShopPayments()
    } else {
      setShopPayments([])
    }
  }, [selectedShopId, reloadShopPayments])

  const handleShopSearch = async (searchTerm: string) => {
    if (searchTerm === '') {
      setFilteredShops(shops)
    } else {
      const filtered = shops.filter((shop) =>
        shop.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredShops(filtered)
    }
  }

  const totalItemsSold = shopPayments.reduce((sum, payment) => sum + payment.quantity, 0)
  const totalShopRevenue = shopPayments.reduce((sum, payment) => sum + payment.pricePaid, 0)

  const shopParticipantEmails = Array.from(
    new Set(
      shopPayments
        .map((p) => (p.user?.email || p.guestEmail)?.trim())
        .filter((email): email is string => !!email && email.length > 0)
    )
  )

  const handleCopyEmails = async () => {
    if (shopParticipantEmails.length === 0) {
      toast.error('No participant emails found')
      return
    }

    const emailString = shopParticipantEmails.join(', ')
    try {
      await navigator.clipboard.writeText(emailString)
      toast.success('Emails copied to clipboard', {
        description: `${shopParticipantEmails.length} email(s) copied`,
        style: { color: '#22c55e' },
      })
    } catch {
      toast.error('Failed to copy emails to clipboard')
    }
  }

  const handleManageShop = () => {
    router.push(`/${locale}/profile?section=admin-all-shops`)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Shop Manager</h1>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Select Shop</label>
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-full max-w-md border">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              <div className="pb-2">
                <Input
                  type="search"
                  autoComplete="off"
                  placeholder="Input value and press Enter to search"
                  value={shopSearchTerm}
                  onChange={(e) => {
                    setShopSearchTerm(e.target.value)
                  }}
                  onKeyDown={async (e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      await handleShopSearch(shopSearchTerm)
                    }
                  }}
                />
              </div>

              {filteredShops.length > 0 ? (
                filteredShops.map((shop: ShopOption) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.title}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-2">You have no shops yet. Please create a shop first.</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedShopId ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Shop Overview</h2>

                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Item Sold</p>
                    <p className="text-2xl font-bold">{totalItemsSold}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">${totalShopRevenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <AddShopPaymentButton
                    user={user}
                    preSelectedShopId={selectedShopId}
                    onPaymentAdded={reloadShopPayments}
                  />
                  <Button onClick={handleCopyEmails} className="w-full" variant="outline">
                    <FiCopy className="mr-2 h-4 w-4" />
                    Copy Email List
                  </Button>
                  <Button onClick={handleManageShop} className="w-full" variant="outline">
                    <FiEdit className="mr-2 h-4 w-4" />
                    Manage Shop
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white shadow-sm">
                <h3 className="border-b px-4 py-3 text-lg font-semibold">
                  Shop Payment Summary
                </h3>
                <div className="space-y-4 p-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <p>Loading...</p>
                    </div>
                  ) : shopPayments.length > 0 ? (
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left">Shop</th>
                            <th className="px-4 py-3 text-left">Item</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="max-w-[140px] break-words px-4 py-3 text-left">
                              Email
                            </th>
                            <th className="max-w-[120px] break-words px-4 py-3 text-left">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Qty</th>
                            <th className="px-4 py-3 text-left">Method</th>
                            <th className="px-4 py-3 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {shopPayments.map((payment) => {
                            const customerName = payment.guestName || payment.user?.name || '-'
                            const customerEmail =
                              payment.guestEmail || payment.user?.email || '-'
                            const customerPhone =
                              payment.guestPhone || payment.user?.phone || '-'

                            return (
                              <tr key={payment.id} className="bg-white">
                                <td className="px-4 py-3">{payment.shop?.title || '-'}</td>
                                <td className="px-4 py-3">{payment.shopItem?.title || '-'}</td>
                                <td className="px-4 py-3">{customerName}</td>
                                <td className="max-w-[140px] break-words px-4 py-3">
                                  {customerEmail}
                                </td>
                                <td className="max-w-[120px] break-words px-4 py-3">
                                  {customerPhone}
                                </td>
                                <td className="px-4 py-3">${payment.pricePaid.toFixed(2)}</td>
                                <td className="px-4 py-3">{payment.quantity}</td>
                                <td className="px-4 py-3">{payment.method}</td>
                                <td className="px-4 py-3">
                                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground">
                        No shop payments found for this shop
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border bg-white p-12">
            <p className="text-muted-foreground">
              Please select a shop to view shop statistics
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

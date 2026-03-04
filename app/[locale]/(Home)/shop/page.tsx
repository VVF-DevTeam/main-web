import initTranslations from '@/app/i18n'
import React from 'react'
import { getAllShops } from '@/lib/actions/shop/getShop'
import ShopBrowsePanel from './_components/ShopBrowsePanel'

interface ShopPageProps {
  params: Promise<{ locale: string }>
}

const ShopPage = async ({ params }: ShopPageProps) => {
  const { locale } = await params
  await initTranslations(locale, ['shop'])
  const rawShops = await getAllShops()
  const shops = rawShops.map((shop) => ({
    ...shop,
    shopItems: shop.shopItems.map((item) => ({
      ...item,
      // Normalize price to number
      price: Number(item.price),
      // Convert related ShopItemTag objects to an array of tag titles
      tags: (item.tags || []).map((tag) => tag.title),
    })),
  }))

  return (
    <div className="mx-auto w-full">
      <ShopBrowsePanel shops={shops} />
    </div>
  )
}

export default ShopPage

import initTranslations from '@/app/i18n'
import React from 'react'
import { getAllShops } from '@/lib/actions/shop/getShop'
import ShopBrowsePanel from './_components/ShopBrowsePanel'
import { Metadata } from 'next'
interface ShopPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ shopSlug?: string }>
}

export const metadata: Metadata = {
  title: 'Shop - Viet Vibe Foundation',
  description: 'Browse our shop and find the perfect item for you',
  openGraph: {
    title: 'Shop - Viet Vibe Foundation',
    description: 'Browse our shop and find the perfect item for you',
    images: {
      url: 'https://drive.google.com/thumbnail?id=1PXKYQic5fhczpFJjMHPK4AyYTjSC-zya&sz=w800',
      alt: 'Browse our shop and find the perfect item for you',
    },
  },
}

const ShopPage = async ({ params, searchParams }: ShopPageProps) => {
  const [{ locale }, { shopSlug }] = await Promise.all([params, searchParams])
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
      <ShopBrowsePanel shops={shops} initialShopSlug={shopSlug} />
    </div>
  )
}

export default ShopPage

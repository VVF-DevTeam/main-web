'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Get all existing shop item tags
// Uses the same caching strategy and 'shops' tag as other shop actions
export const getAllShopItemTags = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')

    return withDbRetry(
      () =>
        prisma.shopItemTag.findMany({
          orderBy: {
            title: 'asc',
          },
        }),
      { label: 'getAllShopItemTags' }
    )
  },
  ['shop-item-tags-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['shops'], // Reuse 'shops' tag since tags are part of shop item data
  }
)

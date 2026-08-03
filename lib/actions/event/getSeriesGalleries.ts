'use server'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

function parseImgUrls(value: Prisma.JsonValue | null | undefined): string[] {
  if (value == null) return []
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && item.trim() !== '') {
      out.push(item.trim())
    }
  }
  return out
}

function normalizeImageUrls(urls: string[]): string[] {
  return urls.filter((u) => typeof u === 'string' && u.trim() !== '').map((u) => u.trim())
}

/** Current event URLs first, then siblings; duplicates removed (first wins). */
function mergeUniquePreservingOrder(base: string[], extra: string[]): string[] {
  const seen = new Set(base)
  const merged = [...base]
  for (const url of extra) {
    if (!seen.has(url)) {
      seen.add(url)
      merged.push(url)
    }
  }
  return merged
}

const getCachedSiblingSeriesGalleryUrls = unstable_cache(
  async (seriesId: string, excludeEventId: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(async () => {
      const siblings = await prisma.event.findMany({
        where: {
          seriesId,
          id: { not: excludeEventId },
          isPublished: true,
        },
        select: { imgUrls: true },
      })
      console.log('siblings', siblings)
      const urls: string[] = []
      for (const row of siblings) {
        urls.push(...parseImgUrls(row.imgUrls))
      }
      return urls
    }, { label: 'getCachedSiblingSeriesGalleryUrls' })
  },
  ['series-sibling-galleries'],
  {
    revalidate: 604800,
    tags: ['events', 'series'],
  }
)

/**
 * Returns `imageUrls` for this event, plus gallery URLs from other published
 * events in the same `EventSeries` (deduped, current event order preserved).
 */
export async function getSeriesGalleries({
  seriesId,
  eventId,
  imageUrls,
}: {
  seriesId: string | null | undefined
  eventId: string
  imageUrls: string[]
}): Promise<string[]> {
  const base = normalizeImageUrls(imageUrls)

  if (!seriesId) {
    return base
  }

  const siblingUrls = await getCachedSiblingSeriesGalleryUrls(seriesId, eventId)
  return mergeUniquePreservingOrder(base, siblingUrls)
}

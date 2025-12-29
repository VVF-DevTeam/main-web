# Prisma Query Cache Recommendations for Profile Folder

## Analysis of Prisma Queries in `app/[locale]/(Home)/profile/[userId]`

### ✅ Already Using Caching:
1. **`getPublishedEvents`** in `page.tsx` - ✅ Now using `getAllPublishedEvents` (cached)

---

### 🔄 Good Candidates for `unstable_cache`:

#### 1. **`getEventPayments`** (`_components/getEventPayments.ts`)
**Current Query:**
```typescript
prisma.payment.findMany({
  where: { eventId, refunded: false },
  // ... selects
})
```
**Recommendation:** ⚠️ **PARTIAL CACHE**
- **Cache Key:** `event-payments-${eventId}`
- **Tags:** `['payments', `payments-event-${eventId}`]`
- **Revalidate:** 300 seconds (5 minutes) - payments change frequently
- **Reason:** Event-specific payments change when new payments/refunds occur, but can be cached short-term

---

#### 2. **`prisma.eventCategory.findMany()`** 
**Locations:**
- `EventCategoryManager.tsx` (line 20)
- `EditEvent.tsx` (line 92)

**Recommendation:** ✅ **EXCELLENT CANDIDATE**
- **Cache Key:** `event-categories-all`
- **Tags:** `['event-categories']`
- **Revalidate:** 604800 seconds (7 days) - categories change infrequently
- **Reason:** Categories are relatively static reference data, perfect for caching

---

#### 3. **`prisma.eventSeries.findMany()`**
**Locations:**
- `EventSeriesManager.tsx` (line 20)
- `EditEvent.tsx` (line 94)

**Recommendation:** ✅ **EXCELLENT CANDIDATE**
- **Cache Key:** `event-series-all`
- **Tags:** `['event-series']`
- **Revalidate:** 604800 seconds (7 days) - series change infrequently
- **Reason:** Series are relatively static reference data, perfect for caching

---

#### 4. **`prisma.eventSponsor.findMany()`** (`SponsorsManagement.tsx` line 21)
**Recommendation:** ✅ **GOOD CANDIDATE**
- **Cache Key:** `event-sponsors-all`
- **Tags:** `['event-sponsors']`
- **Revalidate:** 3600 seconds (1 hour) - sponsors change occasionally
- **Reason:** Sponsors don't change frequently, but more often than categories/series

---

#### 5. **`prisma.event.findMany()`** (`SponsorsManagement.tsx` line 43)
**Recommendation:** ✅ **USE EXISTING CACHE**
- **Replace with:** `getAllEvents()` from `@/lib/actions/event/getEvent`
- **Reason:** Already has cached version available

---

#### 6. **`prisma.event.findUnique()`** (`EditEvent.tsx` line 54)
**Recommendation:** ⚠️ **PARTIAL CACHE**
- **Cache Key:** `event-edit-${eventId}`
- **Tags:** `['events', `event-${eventId}`]`
- **Revalidate:** 60 seconds (1 minute) - events change when edited
- **Reason:** Event data changes frequently during editing, but can cache briefly to reduce DB load

---

#### 7. **`getEventPayments()`** (`getEventPayments.ts`)
**Recommendation:** ✅ **IMPLEMENTED**
- **Cache Key:** `event-payments-${eventId}` (per event)
- **Tags:** `['payments']`
- **Revalidate:** 300 seconds (5 minutes) - payments change when new payments/refunds occur
- **Reason:** ✅ **NOW CACHED** - Event Manager will load much faster as payment data is cached per event. Cache is automatically invalidated when payments are created, refunded, or updated via the existing `revalidateTag('payments')` calls.

---

### ❌ NOT Recommended for Caching:

#### 1. **`getPaymentHistory`** (`page.tsx` line 24)
- **Reason:** User-specific data that changes frequently (new payments, refunds)
- **Alternative:** Consider pagination/caching at component level if needed

---

## Implementation Priority:

### High Priority (Static Reference Data):
1. ✅ **Event Categories** - Create cached function
2. ✅ **Event Series** - Create cached function  
3. ✅ **Event Sponsors** - Create cached function

### Medium Priority (Frequently Accessed):
4. ✅ **Event Payments** - Short-term cache (5 min) - **IMPLEMENTED**
5. ⚠️ **Edit Event** - Very short-term cache (1 min)

### Low Priority (Already Optimized):
6. ✅ **All Events** - Already using cached `getAllEvents()`

---

## Suggested Cache Functions to Create:

### 1. `lib/actions/event/getEventCategories.ts`
```typescript
export const getAllEventCategories = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return await prisma.eventCategory.findMany()
  },
  ['event-categories-all'],
  {
    revalidate: 604800,
    tags: ['event-categories'],
  }
)
```

### 2. `lib/actions/event/getEventSeries.ts`
```typescript
export const getAllEventSeries = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return await prisma.eventSeries.findMany({
      orderBy: { name: 'asc' },
    })
  },
  ['event-series-all'],
  {
    revalidate: 604800,
    tags: ['event-series'],
  }
)
```

### 3. `lib/actions/event/getEventSponsors.ts`
```typescript
export const getAllEventSponsors = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return await prisma.eventSponsor.findMany({
      orderBy: { name: 'asc' },
      include: {
        events: {
          include: {
            event: {
              select: { id: true, title: true },
            },
          },
          orderBy: { tier: 'asc' },
        },
      },
    })
  },
  ['event-sponsors-all'],
  {
    revalidate: 3600,
    tags: ['event-sponsors'],
  }
)
```


# Cache Revalidation Documentation

This document provides a comprehensive overview of all functions using `unstable_cache` and their associated cache keys, tags, and revalidation points.

---

## Table of Contents
1. [Functions Using `unstable_cache`](#functions-using-unstable_cache)
2. [Tag-Based Revalidation Mapping](#tag-based-revalidation-mapping)
3. [Summary by Tag](#summary-by-tag)

---

## Functions Using `unstable_cache`

### Events

#### 1. `getAllPublishedEvents`
- **File**: `lib/actions/event/getEvent.ts`
- **Cache Key**: `['events-published-all']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns minimal fields (id, title) for backward compatibility

#### 2. `getAllPublishedEventsWithRelations`
- **File**: `lib/actions/event/getEvent.ts`
- **Cache Key**: `['events-published-with-relations']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns all published events with relations (categories, tickets)

#### 3. `getPublishedEventsWithFilters`
- **File**: `lib/actions/event/getEvent.ts`
- **Cache Key**: `['events-published-filtered']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns published events with filters (numberOfEvents, upcoming, finished, orderByField, etc.)

#### 4. `getClosestFutureEvent`
- **File**: `lib/actions/event/getEvent.ts`
- **Cache Key**: `['events-closest-future']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns the closest future published event (ordered by startDate ascending)

#### 5. `getEventById` (via `getCachedEventById`)
- **File**: `lib/actions/event/getEventById.ts`
- **Cache Key**: `['event-by-id']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns a single event by ID with relations (hosts, schedules). Time filtering is applied after cache retrieval.

#### 6. `getEventPagination` (via `getCachedEventPagination`)
- **File**: `lib/actions/event/getEventPagination.ts`
- **Cache Key**: `['events-pagination']`
- **Tags**: `['events']`
- **Revalidate Time**: 3600 seconds (1 hour - shorter due to time-based filtering)
- **Description**: Returns paginated events with search and filtering. Time filtering is applied after cache retrieval.

#### 7. `getEventByKeyName`
- **File**: `lib/actions/event/getEventById.ts`
- **Cache Key**: `['event-by-keyname']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns a single event by keyName with full relations (schedules, categories, hosts, tickets, sponsors, series). Used for event detail pages and metadata generation.

#### 8. `getAllEvents`
- **File**: `lib/actions/event/getEvent.ts`
- **Cache Key**: `['events-all']`
- **Tags**: `['events']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns all events (published and unpublished) for admin use only. Cache is invalidated when events are created/updated/deleted.

---

### Reviews

#### 5. `getCachedReviewsPaginated`
- **File**: `lib/actions/review/reviewActions.ts`
- **Cache Key**: `['reviews-paginated']`
- **Tags**: `['reviews']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns paginated reviews with search, filtering, and pagination support

#### 6. `getCachedPublishedEventsForReviews`
- **File**: `lib/actions/review/reviewActions.ts`
- **Cache Key**: `['published-events-reviews']`
- **Tags**: `['events', 'reviews']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns published events for review filtering with search support

#### 7. `getCachedPublishedSeriesForReviews`
- **File**: `lib/actions/review/reviewActions.ts`
- **Cache Key**: `['published-series-reviews']`
- **Tags**: `['series', 'reviews']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns published series that have events with reviews

---

### Posts

#### 8. `getCachedPostsPaginated`
- **File**: `lib/actions/post/getPosts.ts`
- **Cache Key**: `['posts-paginated']`
- **Tags**: `['posts']`
- **Revalidate Time**: 604800 seconds (7 days)
- **Description**: Returns paginated posts with search by title

---

### Social Media Posts

#### 9. `getCachedSocialMediaPostsPaginated`
- **File**: `lib/actions/post/getSocialPost.ts`
- **Cache Key**: `['social-media-posts']`
- **Tags**: `['social-posts']`
- **Revalidate Time**: 600 seconds (10 minutes)
- **Description**: Returns paginated social media posts from Facebook and Instagram

---

### Users

#### 10. `getUsersSimple` (via `getCachedUsersSimple`)
- **File**: `lib/actions/user/getAllUsersSimple.ts`
- **Cache Key**: `['users-simple']`
- **Tags**: `['users']`
- **Revalidate Time**: 3600 seconds (1 hour)
- **Description**: Returns list of users with optional count limit and name search

#### 11. `getUsersWithRole` (via `getCachedUsersWithRole`)
- **File**: `lib/actions/user/getUsersWithRole.ts`
- **Cache Key**: `['users-with-role']`
- **Tags**: `['users']`
- **Revalidate Time**: 3600 seconds (1 hour)
- **Description**: Returns users filtered by role with optional name search

---

## Tag-Based Revalidation Mapping

### Tag: `'events'`

**Cached Functions Affected:**
- `getAllPublishedEvents`
- `getAllPublishedEventsWithRelations`
- `getPublishedEventsWithFilters`
- `getClosestFutureEvent`
- `getEventById` (via `getCachedEventById`)
- `getEventPagination` (via `getCachedEventPagination`)
- `getEventByKeyName`
- `getAllEvents`
- `getCachedPublishedEventsForReviews` (also tagged with 'reviews')

**Functions Calling `revalidateTag('events')`:**

1. **`app/api/events/create/route.ts`**
   - Function: `POST`
   - Line: 21
   - Action: Creates a new event

2. **`app/api/events/edit/[eventId]/route.ts`**
   - Function: `PUT`
   - Line: 53
   - Action: Updates an existing event

3. **`app/api/events/publish/[eventId]/route.ts`**
   - Function: `PATCH`
   - Line: 32
   - Action: Publishes an event (sets isPublished to true)

4. **`app/api/events/unpublish/[eventId]/route.ts`**
   - Function: `PATCH`
   - Line: 34
   - Action: Unpublishes an event (sets isPublished to false)

5. **`app/api/events/delete/[eventId]/route.ts`**
   - Function: `DELETE`
   - Line: 36
   - Action: Deletes an event

6. **`app/api/events/edit/[eventId]/series/edit/route.ts`**
   - Function: `PUT` (line 35)
   - Function: `DELETE` (line 73)
   - Action: Adds or removes series from an event

7. **`app/api/events/edit/[eventId]/hosts/edit/route.ts`**
   - Function: `PUT` (line 37)
   - Function: `DELETE` (line 81)
   - Action: Adds or removes hosts from an event

8. **`app/api/events/edit/[eventId]/categories/edit/route.ts`**
   - Function: `POST` (line 28)
   - Function: `DELETE` (line 62)
   - Action: Adds or removes categories from an event

9. **`app/api/events/tickets/route.ts`**
   - Function: `POST` (create ticket)
   - Function: `PUT` (update ticket)
   - Function: `DELETE` (delete ticket)
   - Action: Creates, updates, or deletes event tickets. Tickets are included in cached event queries, so changes must invalidate the cache.

10. **`app/api/events/schedule/scheduleItem/add/route.ts`**
    - Function: `POST`
    - Action: Adds a new schedule item to an event. Schedules are included in cached event queries, so changes must invalidate the cache.

11. **`app/api/events/schedule/scheduleItem/edit/[scheduleItemId]/route.ts`**
    - Function: `PUT`
    - Action: Updates an existing schedule item. Schedules are included in cached event queries, so changes must invalidate the cache.

12. **`app/api/events/schedule/scheduleItem/delete/[itemId]/route.ts`**
    - Function: `DELETE`
    - Action: Deletes a schedule item from an event. Schedules are included in cached event queries, so changes must invalidate the cache.

13. **`app/api/events/forms/[eventId]/route.ts`**
    - Function: `PUT`
    - Action: Creates or updates event form data. Event forms are part of event data, so changes must invalidate the cache.

---

### Tag: `'reviews'`

**Cached Functions Affected:**
- `getCachedReviewsPaginated`
- `getCachedPublishedEventsForReviews` (also tagged with 'events')
- `getCachedPublishedSeriesForReviews` (also tagged with 'series')

**Functions Calling `revalidateTag('reviews')`:**

1. **`lib/actions/review/reviewActions.ts`**
   - Function: `createReview` (line 270)
     - Action: Creates a new review
   - Function: `updateReview` (line 509)
     - Action: Updates an existing review
   - Function: `deleteReview` (line 528)
     - Action: Deletes a review

---

### Tag: `'posts'`

**Cached Functions Affected:**
- `getCachedPostsPaginated`

**Functions Calling `revalidateTag('posts')`:**

1. **`app/api/posts/create/route.tsx`**
   - Function: `POST`
   - Line: 20
   - Action: Creates a new post

2. **`app/api/posts/edit/[postId]/route.tsx`**
   - Function: `PUT`
   - Line: 36
   - Action: Updates an existing post

3. **`app/api/posts/publish/[postId]/route.ts`**
   - Function: `PATCH`
   - Line: 34
   - Action: Publishes a post (sets isPublished to true)

4. **`app/api/posts/unpublish/[postId]/route.ts`**
   - Function: `PATCH`
   - Line: 34
   - Action: Unpublishes a post (sets isPublished to false)

5. **`app/api/posts/delete/[postId]/route.ts`**
   - Function: `DELETE`
   - Line: 32
   - Action: Deletes a post

---

### Tag: `'series'`

**Cached Functions Affected:**
- `getCachedPublishedSeriesForReviews` (also tagged with 'reviews')

**Functions Calling `revalidateTag('series')`:**

1. **`app/api/series/create/route.ts`**
   - Function: `POST`
   - Line: After series creation
   - Action: Creates a new event series

2. **`app/api/series/edit/[seriesId]/route.ts`**
   - Function: `PUT`
   - Line: After series update
   - Action: Updates an existing event series

---

### Tag: `'social-posts'`

**Cached Functions Affected:**
- `getCachedSocialMediaPostsPaginated`

**Functions Calling `revalidateTag('social-posts')`:**
- **None found** - This tag is used but no explicit revalidation calls were found in the codebase. Since this fetches external API data (Facebook/Instagram), manual revalidation may not be necessary, but consider adding it if needed.

---

### Tag: `'users'`

**Cached Functions Affected:**
- `getUsersSimple` (via `getCachedUsersSimple`)
- `getUsersWithRole` (via `getCachedUsersWithRole`)

**Functions Calling `revalidateTag('users')`:**

1. **`app/api/users/edit/route.ts`**
   - Function: `PUT`
   - Line: After user update
   - Action: Updates user information (name, age, phone, address, image)

2. **`app/api/users/phone-verified/route.ts`**
   - Function: `POST`
   - Line: After phone verification update
   - Action: Updates user phone verification status

3. **`lib/actions/user/updateUser.ts`**
   - Function: `updateUser` (server action)
   - Line: After user update
   - Action: Updates user profile information

4. **`lib/actions/user/deleteUser.ts`**
   - Function: `deleteUser` (server action)
   - Line: After user deletion
   - Action: Deletes a user account

5. **`lib/actions/auth/signupAction.ts`**
   - Function: `signupAction` (server action)
   - Line: After user creation
   - Action: Creates a new user account

6. **`app/api/auth/m/signup/route.ts`**
   - Function: `POST`
   - Line: After user creation
   - Action: Creates a new user account via API

---

## Summary by Tag

### Complete Tag Coverage

| Tag | Cached Functions | Revalidation Points | Status |
|-----|-----------------|---------------------|--------|
| `events` | 9 functions | 13 API routes | ✅ Fully covered |
| `reviews` | 3 functions | 3 server actions | ✅ Fully covered |
| `posts` | 1 function | 5 API routes | ✅ Fully covered |
| `series` | 1 function | 2 API routes | ✅ Fully covered |
| `social-posts` | 1 function | 0 revalidation points | ⚠️ External API (may not need) |
| `users` | 2 functions | 6 revalidation points | ✅ Fully covered |

---

## Notes

1. **Cache Duration**: Most cached functions use a 7-day cache (604800 seconds), except for:
   - Social media posts: 10 minutes (600 seconds) due to external API calls
   - User-related functions: 1 hour (3600 seconds) due to more frequent data changes
   - Event pagination: 1 hour (3600 seconds) due to time-based filtering

2. **Multi-Tag Functions**: Some functions use multiple tags (e.g., `getCachedPublishedEventsForReviews` uses both `'events'` and `'reviews'`), meaning they will be invalidated when either tag is revalidated.

3. **Series Revalidation**: The `'series'` tag is now properly revalidated when series are created or updated via the API routes.

4. **External Data**: Social media posts fetch from external APIs (Facebook/Instagram), so manual revalidation may not be necessary, but the cache will auto-refresh every 10 minutes.

---

## Usage Guidelines

- When creating, updating, or deleting events, always call `revalidateTag('events')`
- When creating, updating, or deleting event tickets, always call `revalidateTag('events')` (tickets are included in cached event queries)
- When creating, updating, or deleting event schedules, always call `revalidateTag('events')` (schedules are included in cached event queries)
- When creating, updating, or deleting event forms, always call `revalidateTag('events')`
- When creating, updating, or deleting reviews, always call `revalidateTag('reviews')`
- When creating, updating, or deleting posts, always call `revalidateTag('posts')`
- When creating or updating series, always call `revalidateTag('series')`
- When creating, updating, or deleting users, or changing user roles, call `revalidateTag('users')`
- Social media posts cache automatically refreshes every 10 minutes

## Recent Updates

### 2024 - Event Caching Improvements

1. **Added `getEventByKeyName` cached function**
   - Caches event queries by keyName with full relations
   - Used for event detail pages and metadata generation
   - Ensures query only runs once per request even when called from both `generateMetadata` and page component

2. **Added `getAllEvents` cached function**
   - Caches all events (published and unpublished) for admin use
   - Previously uncached due to need for fresh data
   - Now safe to cache because all event mutations properly invalidate the cache

3. **Extended revalidation coverage**
   - Added `revalidateTag('events')` to tickets API (create, update, delete)
   - Added `revalidateTag('events')` to schedule item APIs (add, edit, delete)
   - Ensures cached event data (which includes tickets and schedules) stays fresh when these related entities change

### Why Related Entities Need Revalidation

Event queries often include related data:
- **Tickets**: Included in `getAllPublishedEventsWithRelations`, `getPublishedEventsWithFilters`, and `getEventByKeyName`
- **Schedules**: Included in `getEventByKeyName` and `getEventById`
- **Categories, Hosts, Series**: Included in various cached event queries

When any of these related entities change, the cached event data becomes stale. Therefore, all mutation APIs for these entities must call `revalidateTag('events')` to ensure users see updated data immediately.

